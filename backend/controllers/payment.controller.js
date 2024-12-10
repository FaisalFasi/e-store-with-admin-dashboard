import mongoose from "mongoose";
import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupen.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.images[0]],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

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
        userId: req.user._id.toString(),
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
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  const mongoDB_Session = await mongoose.startSession();

  try {
    await mongoDB_Session.startTransaction();

    const { sessionId } = req.body;
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    const products = JSON.parse(stripeSession.metadata.products);

    if (stripeSession.payment_status === "paid") {
      // Deactivate coupon if used
      if (stripeSession.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: stripeSession.metadata.couponCode,
            userId: stripeSession.metadata.userId,
          },
          {
            isActive: false,
          },
          {
            session: mongoDB_Session,
          }
        );
      }

      console.log("Products in payment:", products);

      // Update product quantities

      for (const product of products) {
        const foundProduct = await Product.findById(product.id).session(
          mongoDB_Session
        );

        if (!foundProduct) {
          return res.status(404).json({
            message: `Product with id ${product.id} not found`,
          });
        }
        if (foundProduct && foundProduct.quantity >= product.quantity) {
          foundProduct.quantity -= product.quantity;

          await foundProduct.save({ session: mongoDB_Session });
        } else {
          return res.status(400).json({
            message: `Product with id ${product.id} has insufficient quantity`,
          });
        }
      }

      const newOrder = new Order({
        user: stripeSession.metadata.userId,
        products: products.map((p) => ({
          product: p.id,
          quantity: p.quantity,
          price: p.price,
        })),
        totalAmount: stripeSession.amount_total / 100, // convert from cents to dollars,
        stripeSessionId: sessionId,
        status: "Pending",
      });

      await newOrder.save({ session: mongoDB_Session });

      await mongoDB_Session.commitTransaction();
      mongoDB_Session.endSession();

      res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    await mongoDB_Session.abortTransaction();
    mongoDB_Session.endSession();

    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
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
