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
      return res.status(400).json({ error: "User is not logged in" });
    }

    const shippingAddress = await UserAddress.findOne({ userId });

    if (!shippingAddress) {
      return res.status(400).json({ error: "Please add a shipping address" });
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
          throw new Error(
            `Product variation not found for product: ${product.name}`
          );
        }
        const __selectedProductVariationData = __productVariation?.colors?.map(
          (color) => {
            return {
              color: color?.name?.toUpperCase(),
              size: color.sizes[0].value,
              price: color.sizes[0].price,
              imageUrls: color.imageUrls,
              quantity: product.quantity,
            };
          }
        );

        // Find the selected color (case-insensitive)
        const selectedColor = __selectedProductVariationData[0]?.color;
        console.log("selectedColor", selectedColor);

        if (!selectedColor) {
          throw new Error(
            `Selected color not found for product: ${product.name}`
          );
        }

        // Find the selected size
        const selectedSize = __selectedProductVariationData[0].size;

        if (!selectedSize) {
          throw new Error(
            `Selected size not found for product: ${product.name}`
          );
        }

        // Get the price and quantity
        const price = __selectedProductVariationData[0].price;

        const quantity = __selectedProductVariationData[0].quantity || 1;

        const imageUrl = __selectedProductVariationData[0]?.imageUrls || [];

        if (isNaN(price)) {
          throw new Error(`Invalid price for product: ${product.name}`);
        }

        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for product: ${product.name}`);
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
            price: p.basePrice, // Use basePrice as fallback
            selectedVariation: p.selectedVariation,
            selectedColor: p.selectedColor,
            selectedSize: p.selectedSize,
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
      return res.status(400).json({ message: "Invalid Stripe session ID" });
    }

    // Validate Stripe session payment status
    if (stripeSession.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment status is not 'paid'" });
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
        const selectedVariation = foundProduct.variations.find(
          (v) => v._id.toString() === product.selectedVariation
        );

        if (!selectedVariation) {
          return res.status(400).json({
            message: `Selected variation not found for product: ${foundProduct.name}`,
          });
        }

        // Find the selected color
        const selectedColor = selectedVariation.colors.find(
          (c) => c.name === product.selectedColor
        );

        if (!selectedColor) {
          return res.status(400).json({
            message: `Selected color not found for product: ${foundProduct.name}`,
          });
        }

        // Find the selected size
        const selectedSize = selectedColor.sizes.find(
          (s) => s.value === product.selectedSize
        );

        if (!selectedSize) {
          return res.status(400).json({
            message: `Selected size not found for product: ${foundProduct.name}`,
          });
        }

        // Check if there's enough stock
        if (selectedSize.quantity < product.quantity) {
          return res.status(400).json({
            message: `Insufficient inventory for Product: ${foundProduct.name}`,
          });
        }

        // Update the stock
        selectedSize.quantity -= product.quantity;
        await foundProduct.save({ session: mongoDB_Session });
      }

      // Create a new order
      const newOrder = await Order.create(
        [
          {
            user: userId,
            products: products.map((p) => ({
              product: p.id,
              quantity: p.quantity,
              price: p.price,
              selectedVariation: p.selectedVariation,
              selectedColor: p.selectedColor,
              selectedSize: p.selectedSize,
            })),
            totalAmount: stripeSession.amount_total / 100, // Convert cents to dollars
            status: "Pending",
            paymentDetails: {
              method: "Card",
              transactionId: stripeSession.payment_intent,
              paymentStatus: "paid",
            },
            dispatchDetails: {
              dispatchedBy: "DHL or FedEx or UPS or Hermes",
              dispatchedAt: null,
              deliveryEstimate: null,
            },
            shippingAddress: await UserAddress.findOne({ userId }),
            orderHistory: {
              status: "Payment Confirmed",
              timestamp: Date.now(),
            },
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
    res.status(500).json({
      success: false,
      message: "Error processing checkout",
      error: error.message,
    });
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
