import mongoose from "mongoose";
import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupen.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import UserAddress from "../models/address.model.js";
import { handleError } from "../utils/handleError/handleError.js";
import ProductVariation from "../models/productVariation.model.js";

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
              name: color?.name?.toUpperCase(),
              size: color.sizes[0].value,
              price: color.sizes[0].price,
              imageUrls: color.imageUrls,
              quantity: product.quantity,
            };
          }
        );

        // Find the selected color (case-insensitive)
        const selectedColor = __selectedProductVariationData[0]?.name;

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
      });
      if (coupon) {
        discountAmount = Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
        totalAmount -= discountAmount;
      }
    }

    const get_price = (p) => p.variations[0].colors[0].sizes[0].price;
    const get_color = (p) => p.variations[0].colors[0].name;
    const get_size = (p) => p.variations[0].colors[0].sizes[0].value;

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
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userType: userId ? "loggedIn" : "guest",
        userId: userId?.toString() || "", // Save user ID if logged in
        guestId: guestId || "", // Save guest ID if not logged in
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity || 1,
            selectedVariation: p.selectedVariation,
          }))
        ),
      },
    });
    // price: get_price(p),
    // selectedColor: get_color(p),
    // selectedSize: get_size(p),

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
              name: color?.name?.toUpperCase() || "",
              size: color.sizes[0].value,
              price: color.sizes[0].price,
              imageUrls: color.imageUrls,
              quantity: product.quantity,
            };
          }
        );

        // Find the selected color
        const selectedColor = __selectedProductVariationData[0]?.name;

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
                const colorName = variation.colors[0]?.name || "";
                const size = variation.colors[0]?.sizes[0]?.value || "";
                const price = variation.colors[0]?.sizes[0]?.price || 0;

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

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
