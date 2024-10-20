import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupen.model.js";
import Order from "../models/order.model.js";

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false }
        );
      }
    }

    // create a new order
    const products = JSON.parse(session.metadata.products);

    const newOrder = new Order({
      userId: session.metadata.userId,
      products: products.map((product) => ({
        product: product.id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: session.amount_total / 100, // converting to dollars from cents
      stripeSessionId: sessionId,
    });
    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment was successful, Order was created",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.log("Error in checkoutSuccess controller : ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    // Check if products array is empty or not
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Please add products to cart" });
    }

    let totalAmount = 0;
    // Create line items for stripe checkout session from products array and calculate totalAmount
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // Converting to cents

      // totalAmount in cents
      totalAmount += amount * product.quantity;

      return {
        // Stripe requires price_data and quantity for each product
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      };
    });

    let coupon = null; // Initialize coupon to null

    // Check if couponCode is provided in request body
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      // Check if coupon is valid then apply discount to totalAmount
      if (coupon) {
        // here we are rounding the discount amount to 2 decimal places
        // i.e totalAmount is 500 cent then we apply 10% discount then 500 * 10 / 100 = 50 cents
        totalAmount -=
          Math.round(totalAmount * coupon.discountPercentage) / 100; // discountPercentage is in percentage so we need to divide by 100 to get the actual discount amount in dollars and cents i.e. 100 cents = 1 dollar then totalAmount is in cents so we need to divide by 100 to get the actual amount in dollars
      }
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // line_items is an array of objects containing price_data and quantity
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

      //   customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((product) => ({
            id: product._id,
            quantity: product.quantity,
            price: product.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      // here we are creating a new coupon for the user to give him a gift if the totalAmount is greater than or equal to 200 dollars
      await createNewStripeCoupon(req.user._id, 10);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (err) {
    console.log("Error in createCheckoutSession controller : ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

async function createStripeCoupon(discountPercentage) {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: discountPercentage,
      duration: "once",
    });

    return coupon.id;
  } catch (err) {
    console.log("Error in createStripeCoupon : ", err.message);
    throw new Error("Error in createStripeCoupon");
  }
}

async function createNewStripeCoupon(userId, discountPercentage) {
  try {
    const newCoupon = await Coupon({
      // here we are generating a random coupon code for the user and adding it to the database
      // random is a function that generates a random number between 0 and 1
      // toString(36) converts the number to a string with base 36 and 36 means that the string will contain numbers and alphabets
      // substring(2, 8) means that we are taking the substring from index 2 to 8

      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: discountPercentage,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      userId: userId,
    });

    await newCoupon.save();

    return newCoupon;
  } catch (err) {
    console.log("Error in createStripeCoupon : ", err.message);
    throw new Error("Error in createStripeCoupon");
  }
}
