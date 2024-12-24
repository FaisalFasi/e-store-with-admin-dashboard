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
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
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
      // Atomically check if the order exists and create it if not
      const existingOrder = await Order.findOneAndUpdate(
        { stripeSessionId: stripeSession.id }, // Query to check if the order exists
        {
          $setOnInsert: {
            user: userId,
            products: JSON.parse(stripeSession.metadata.products).map((p) => ({
              product: p.id,
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
            shippingAddress: await UserAddress.findOne({ userId: userId }),
            stripeSessionId: stripeSession.id, // Ensure idempotency
          },
        },
        { session: mongoDB_Session, upsert: true, new: true } // Options: use transaction, create if not exists
      );

      // If an existing order is found, return it
      if (!existingOrder.n) {
        return res.status(200).json({
          success: true,
          message: "Order already exists for this checkout session.",
          orderId: existingOrder._id,
        });
      }
      // Deduct product inventory
      // Deduct product inventory with map and concurrency
      const products = JSON.parse(stripeSession.metadata.products);

      await Promise.all(
        products.map(async (product) => {
          // Fetch the product within the transaction
          const foundProduct = await Product.findById(product.id).session(
            mongoDB_Session
          );

          if (!foundProduct) {
            throw new Error(`Product with id ${product.id} not found`);
          }

          // Check if sufficient quantity is available
          if (foundProduct.quantity < product.quantity) {
            throw new Error(
              `Insufficient quantity for product with id ${product.id}`
            );
          }

          // Deduct the quantity
          foundProduct.quantity -= product.quantity;

          // Save the updated product within the transaction
          await foundProduct.save({ session: mongoDB_Session });
        })
      );

      // If coupon exists, deactivate it
      if (stripeSession.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: stripeSession.metadata.couponCode, userId: userId },
          { isActive: false },
          { session: mongoDB_Session }
        );
      }

      // Return success response
      return res.status(200).json({
        success: true,
        message: "Order created successfully.",
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

// export const checkoutSuccess = async (req, res) => {
//   const mongoDB_Session = await mongoose.startSession();
//   const userId = req.user ? req.user._id : null;

//   try {
//     const { sessionId } = req.body;
//     const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

//     if (!stripeSession || !stripeSession.id) {
//       return res.status(400).json({ message: "Invalid Stripe session ID" });
//     }
//     // Get products from metadata
//     const products = JSON.parse(stripeSession.metadata.products);

//     // Check if stripeSessionId is null
//     if (!stripeSession.id || stripeSession.id === null) {
//       return res
//         .status(400)
//         .json({ message: "Stripe session ID cannot be null" });
//     }
//     // start transaction for mongodb

//     // Check if order already exists with the same stripeSessionId
//     const existingOrder = await Order.findOne({
//       stripeSessionId: stripeSession.id,
//     });

//     if (existingOrder) {
//       return res
//         .status(400)
//         .json({ message: "Order with this Stripe session ID already exists." });
//     }
//     // start transaction for mongodb
//     await mongoDB_Session.startTransaction();

//     if (stripeSession.payment_status === "paid") {
//       // Deactivate coupon if used
//       if (stripeSession.metadata.couponCode) {
//         await Coupon.findOneAndUpdate(
//           {
//             code: stripeSession.metadata.couponCode,
//             userId: userId,
//           },
//           {
//             isActive: false,
//           },
//           {
//             session: mongoDB_Session,
//           }
//         );
//       }

//       // Update product quantities
//       for (const product of products) {
//         // here session is used to make sure that the transaction is atomic and atomic means that either all the operations are successful or none of them are successful
//         const foundProduct = await Product.findById(product.id).session(
//           mongoDB_Session
//         );

//         if (!foundProduct) {
//           return res.status(404).json({
//             message: `Product with id ${product.id} not found`,
//           });
//         }
//         if (foundProduct.quantity >= product.quantity) {
//           foundProduct.quantity -= product.quantity;

//           await foundProduct.save({ session: mongoDB_Session });
//         } else {
//           return res.status(400).json({
//             message: `Product with id ${product.id} has insufficient quantity`,
//           });
//         }
//       }
//       const shipping_address = await UserAddress.findOne({
//         userId: userId,
//       });
//       if (!shipping_address) {
//         return res.status(404).json({ message: "Shipping Address not found" });
//       }

//       const newOrder = new Order({
//         user: userId,
//         products: products.map((p) => ({
//           product: p.id,
//           quantity: p.quantity,
//           price: p.price,
//         })),
//         totalAmount: stripeSession.amount_total / 100, // convert from cents to dollars,
//         stripeSessionId: stripeSession.id,
//         status: "Pending",
//         paymentDetails: {
//           method: "Card",
//           transactionId: stripeSession.payment_intent,
//           paymentStatus: "paid",
//         },
//         dispatchDetails: {
//           dispatchedBy: "DHL or FedEx or UPS or Hermes",
//           dispatchedAt: null,
//           deliveryEstimate: null,
//         },
//         shippingAddress: shipping_address,
//       });

//       await newOrder.save({ session: mongoDB_Session });

//       await mongoDB_Session.commitTransaction();
//       mongoDB_Session.endSession();

//       res.status(200).json({
//         success: true,
//         message:
//           "Payment successful, order created, and coupon deactivated if used.",
//         orderId: newOrder._id,
//       });
//     }
//   } catch (error) {
//     await mongoDB_Session.abortTransaction();
//     mongoDB_Session.endSession();

//     console.error("Error processing successful checkout:", error);
//     res.status(500).json({
//       message: "Error processing successful checkout",
//       error: error.message,
//     });
//   }
// };
