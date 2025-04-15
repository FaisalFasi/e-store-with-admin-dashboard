import mongoose from "mongoose";
import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupen.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import UserAddress from "../models/address.model.js";
import { handleError } from "../utils/handleError/handleError.js";
import ProductVariation from "../models/productVariation.model.js";
import crypto from "crypto";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode, guestId } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!Array.isArray(products) || products.length === 0) {
      return handleError(res, "Invalid or empty products array", 400);
    }

    // Validate shipping address before proceeding
    if (!userId) {
      return handleError(res, "User is not logged in", 400);
    }

    const shippingAddress = await UserAddress.findOne({ userId });

    if (!shippingAddress) {
      return handleError(res, "Please add a shipping address", 400);
    }

    // Step 1: Calculate Total and Generate Line Items
    let totalAmount = 0;
    const lineItems = await Promise.all(
      products.map(async (product) => {
        // Fetch the product variation
        const __productVariation = await ProductVariation.findById(
          product?.selectedVariation
        ).lean();

        if (!__productVariation) {
          return handleError(
            res,
            `Product variation not found for product: ${product.name}`,
            400
          );
        }
        const __selectedProductVariationData = __productVariation?.colors?.map(
          (color) => {
            return {
              color: color?.color,
              colorName: color?.colorName?.toUpperCase(),
              size: color.sizes[0].size,
              price: color.sizes[0].price.amount,
              imageUrls: color.imageUrls,
              quantity: product.quantity,
            };
          }
        );

        // Find the selected color (case-insensitive)
        const selectedColor = __selectedProductVariationData[0]?.colorName;

        if (!selectedColor) {
          return handleError(
            res,
            `Selected color not found for product: ${product.name}`,
            400
          );
        }

        // Find the selected size
        const selectedSize = __selectedProductVariationData[0].size;

        if (!selectedSize) {
          return handleError(
            res,
            `Selected size not found for product: ${product.name}`,
            400
          );
        }

        // Get the price and quantity
        const price = __selectedProductVariationData[0].price;

        const quantity = __selectedProductVariationData[0].quantity || 1;

        const imageUrl = __selectedProductVariationData[0]?.imageUrls || [];

        if (isNaN(price)) {
          return handleError(
            res,
            `Invalid price for product: ${product.name}`,
            400
          );
        }

        if (isNaN(quantity) || quantity <= 0) {
          return handleError(
            res,
            `Invalid quantity for product: ${product.name}`,
            400
          );
        }

        const amount = Math.round(price * 100); // Convert to cents
        totalAmount += amount * quantity;

        return {
          price_data: {
            currency: "usd", // Stripe expects lowercase currency codes
            product_data: {
              name: product.name,
              images: imageUrl,
            },
            unit_amount: amount,
          },
          quantity: quantity,
        };
      })
    );

    // Validate lineItems
    if (!lineItems || lineItems.length === 0) {
      return handleError(res, "Error due to Line item", 403);
    }

    // Step 2: Handle Coupon (If Provided)
    let discountAmount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: userId,
        isActive: true,
      }).lean();

      if (coupon) {
        if (!coupon.discountValue || !coupon.discountType) {
          return handleError(res, "Invalid coupon configuration", 400);
        }

        // Calculate discount based on type
        if (coupon.discountType === "percentage") {
          discountAmount = Math.round(
            (totalAmount * coupon.discountValue) / 100
          );
        } else if (coupon.discountType === "fixed") {
          discountAmount = Math.round(coupon.discountValue * 100); // Convert to cents
        }

        totalAmount = Math.max(0, totalAmount - discountAmount); // Ensure total doesn't go negative
      }
    }

    // Step 3: Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(
                coupon.discountValue,
                coupon.discountType
              ),
            },
          ]
        : [],
      metadata: {
        userType: userId ? "loggedIn" : "guest",
        userId: userId?.toString() || "", // Save user ID if logged in
        guestId: guestId || "", // Save guest ID if not logged in
        couponCode: couponCode || null,
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity || 1,
            selectedVariation: p.selectedVariation,
          }))
        ),
      },
    });

    // Step 4: Create a new coupon if total amount is above a threshold
    if (totalAmount >= 20000) {
      await createNewCoupon(userId);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: error.message || "Error processing checkout" });
  }
};

export const checkoutSuccess = async (req, res) => {
  const mongoDB_Session = await mongoose.startSession();
  const userId = req.user ? req.user._id : null;

  try {
    const { sessionId } = req.body;

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (!stripeSession || !stripeSession.id) {
      return handleError(res, "Invalid Stripe session ID", 400);
    }

    // Validate Stripe session payment status
    if (stripeSession.payment_status !== "paid") {
      return handleError(res, "Payment status is not 'paid", 400);
    }

    await mongoDB_Session.withTransaction(async () => {
      // Check if an order already exists for this Stripe session
      const existingOrder = await Order.findOne({
        stripeSessionId: stripeSession.id,
      }).session(mongoDB_Session);

      if (existingOrder) {
        // If the order already exists, return success response
        return res.status(200).json({
          success: true,
          message: "Order already processed.",
          orderId: existingOrder._id,
        });
      }

      // Parse the products from Stripe metadata
      const products = JSON.parse(stripeSession.metadata.products);

      // Update product inventory
      for (const product of products) {
        const foundProduct = await Product.findById(product.id).session(
          mongoDB_Session
        );

        if (!foundProduct) {
          return res.status(400).json({
            message: `Product not found: ${product.id}`,
          });
        }

        // Find the selected variation
        const selectedVariation = product.selectedVariation;

        console.log(
          "Selected Variation:",
          selectedVariation,
          "Product ID:",
          product
        );

        if (!selectedVariation) {
          return handleError(
            res,
            `Selected variation not found for product: ${foundProduct.name}`,
            400
          );
        }

        const getVariationData = await ProductVariation.findById(
          selectedVariation
        ).session(mongoDB_Session);

        if (!getVariationData) {
          return handleError(
            res,
            `Product variation not found for product: ${product.name}`,
            400
          );
        }
        const __selectedProductVariationData = getVariationData?.colors?.map(
          (color) => {
            return {
              color: color?.color || "",
              colorName: color?.colorName?.toUpperCase() || "",
              size: color.sizes[0].size,
              price: color.sizes[0].price.amount,
              imageUrls: color.imageUrls,
              quantity: product.quantity,
            };
          }
        );

        // Find the selected color
        const selectedColor = __selectedProductVariationData[0]?.colorName;

        if (!selectedColor) {
          return handleError(
            res,
            `Selected color not found for product: ${foundProduct.name}`,
            400
          );
        }

        // Find the selected size
        const selectedSize = __selectedProductVariationData[0]?.size;

        if (!selectedSize) {
          return handleError(
            res,
            `Selected size not found for product: ${foundProduct.name}`,
            400
          );
        }

        const availableQuantity = __selectedProductVariationData[0].quantity;

        // Check if there's enough stock
        if (availableQuantity < product.quantity) {
          return handleError(
            res,
            `Insufficient inventory for Product: ${foundProduct.name}`,
            400
          );
        }

        // Update the stock
        getVariationData.colors[0].sizes[0].quantity -= product.quantity;

        await getVariationData.save({ session: mongoDB_Session });
        await foundProduct.save({ session: mongoDB_Session });
      }

      // Retrieve the shipping address
      const userAddress = await UserAddress.findOne({ userId }).session(
        mongoDB_Session
      );

      if (!userAddress) {
        return handleError(
          res,
          "Shipping address not found for the user.",
          400
        );
      }

      const userShippingAddress = {
        fullName: userAddress.fullName,
        street: userAddress.street,
        city: userAddress.city,
        zip: userAddress.zip,
        state: userAddress.state,
        country: userAddress.country,
        phoneNumber: userAddress.phoneNumber,
      };
      // Create a new order
      const newOrder = await Order.create(
        [
          {
            user: userId,
            products: await Promise.all(
              products?.map(async (p) => {
                // Fetch the product variation to get price, color, size
                const variation = await ProductVariation.findById(
                  p.selectedVariation
                ).session(mongoDB_Session);

                if (!variation) {
                  handleError(
                    res,
                    `Variation not found for product ${p.id}`,
                    "checkout success metadata"
                  );
                }

                // Get the first color and size (or implement your logic to get the correct ones)
                const colorName = variation.colors[0]?.colorName || "";
                const size = variation.colors[0]?.sizes[0]?.size || "";
                const price = variation.colors[0]?.sizes[0]?.price.amount || 0;

                return {
                  product: p.id,
                  quantity: p.quantity,
                  price: price,
                  color: colorName,
                  size: size,
                  variation: p.selectedVariation,
                };
              })
            ),

            totalAmount: stripeSession.amount_total / 100, // Convert cents to dollars
            grandTotal: stripeSession.amount_total / 100, // Assuming grandTotal is the same as totalAmount
            status: "Pending",
            paymentDetails: {
              method: "Card",
              transactionId: stripeSession.payment_intent,
              paymentStatus: "paid",
              paymentDate: new Date(),
            },
            dispatchDetails: {
              dispatchedBy: "DHL or FedEx or UPS or Hermes",
              dispatchedAt: null,
              deliveryEstimate: null,
              trackingNumber: null,
              carrier: null,
            },
            shippingAddress: userShippingAddress,
            orderHistory: [
              {
                status: "Payment Confirmed",
                timestamp: Date.now(),
                notes: "Payment successfully processed.",
              },
            ],
            stripeSessionId: stripeSession.id, // Ensure idempotency
          },
        ],
        { session: mongoDB_Session }
      );

      console.log(
        "stripeSession.amount_total:",
        stripeSession.amount_total,
        "stripeSession.amount_subtotal:",
        stripeSession.amount_subtotal
      );
      // Deactivate the coupon if it exists
      if (stripeSession.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: stripeSession.metadata.couponCode, userId: userId },
          { isActive: false },
          { session: mongoDB_Session }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Order created successfully.",
        orderId: newOrder[0]._id,
      });
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    handleError(res, error.message || "Error processing checkout", 400);
  } finally {
    mongoDB_Session.endSession();
  }
};
/**
 * Creates a Stripe coupon with proper validation and support for both percentage and fixed discounts
 * @param {number} discountValue - The discount value (percentage or fixed amount)
 * @param {string} discountType - Either 'percentage' or 'fixed'
 * @returns {Promise<string>} The Stripe coupon ID
 * @throws {Error} If invalid parameters are provided
 */
async function createStripeCoupon(discountValue, discountType) {
  // Validate input parameters
  if (typeof discountValue !== "number" || isNaN(discountValue)) {
    throw new Error("Discount value must be a valid number");
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    throw new Error('Discount type must be either "percentage" or "fixed"');
  }

  // Prepare coupon parameters based on discount type
  const couponParams = {
    duration: "once",
    metadata: {
      created_at: new Date().toISOString(),
      discount_type: discountType,
    },
  };

  if (discountType === "percentage") {
    // Validate percentage range (0-100)
    if (discountValue <= 0 || discountValue > 100) {
      throw new Error("Percentage discount must be between 0 and 100");
    }
    couponParams.percent_off = Math.round(discountValue);
  } else {
    // Validate fixed amount (must be positive)
    if (discountValue <= 0) {
      throw new Error("Fixed discount amount must be greater than 0");
    }
    couponParams.amount_off = Math.round(discountValue * 100); // Convert to cents
    couponParams.currency = "usd";
  }

  try {
    const coupon = await stripe.coupons.create(couponParams);
    return coupon.id;
  } catch (error) {
    console.error("Failed to create Stripe coupon:", error);
    throw new Error(`Could not create coupon: ${error.message}`);
  }
}

async function createNewCoupon(userId, options = {}) {
  const {
    discountValue = 10,
    discountType = "percentage",
    daysValid = 30,
    maxUsage = 1,
    maxUsagePerUser = 1,
    minOrderAmount,
  } = options;

  // Validate input
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (typeof discountValue !== "number" || isNaN(discountValue)) {
    throw new Error("Discount value must be a valid number");
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    throw new Error('Discount type must be either "percentage" or "fixed"');
  }

  // Generate a unique coupon code
  let couponCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  // Keep trying until we find a unique code or reach max attempts
  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    couponCode = "GIFT" + crypto.randomBytes(3).toString("hex").toUpperCase();

    const existingCoupon = await Coupon.findOne({ code: couponCode });
    if (!existingCoupon) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    throw new Error("Failed to generate a unique coupon code");
  }

  // Create new coupon
  const newCoupon = new Coupon({
    code: couponCode,
    discountValue,
    discountType,
    expirationDate: new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000),
    isActive: true,
    maxUsage,
    maxUsagePerUser,
    minOrderAmount,
    userIds: [userId], // Add user to the allowed users list
    createdAt: new Date(),
  });

  // Save and return the coupon
  await newCoupon.save();
  return newCoupon;
}
