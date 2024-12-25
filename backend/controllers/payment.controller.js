import mongoose from "mongoose";
import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupen.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import UserAddress from "../models/address.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode, guestId } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
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
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.images ? [product.images[0]] : [],

            // images: [product.images[0]],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

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
      line_items: lineItems, // use the line items to calculate the total amount
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
        userId: userId.toString() || "", // Save user ID if logged in
        guestId: guestId || "", // Save guest ID if not logged in
        // userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ message: "Error processing checkout" });
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
      const products = JSON.parse(stripeSession.metadata.products);

      for (const product of products) {
        const foundProduct = await Product.findById(product.id).session(
          mongoDB_Session
        );
        if (!foundProduct || foundProduct.quantity < product.quantity) {
          return res.status(400).json({
            message: `Insufficient inventory for Product: ${foundProduct.name}`,
          });
        }
        foundProduct.quantity -= product.quantity;
        await foundProduct.save({ session: mongoDB_Session });
      }

      // Atomically check if the order exists and create it if not
      const existingOrder = await Order.findOneAndUpdate(
        { stripeSessionId: stripeSession.id }, // Query to check if the order exists
        {
          $setOnInsert: {
            user: userId,
            products: products.map((p) => ({
              product: p._id,
              quantity: p.quantity,
              price: p.price,
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
        },
        { session: mongoDB_Session, upsert: true, new: true } // Options: use transaction, create if not exists
      );

      // If coupon exists, deactivate it
      if (stripeSession.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: stripeSession.metadata.couponCode, userId: userId },
          { isActive: false },
          { session: mongoDB_Session }
        );
      }

      if (!existingOrder) {
        // Handle the case where the order was newly created
        return res.status(200).json({
          success: true,
          message: "Order created successfully.",
          orderId: existingOrder._id,
        });
      }
      // Return success response for existing order
      return res.status(200).json({
        success: true,
        message: "Order processed successfully.",
        orderId: existingOrder._id,
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
    mongoDB_Session.endSession(); // Always end the session
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
