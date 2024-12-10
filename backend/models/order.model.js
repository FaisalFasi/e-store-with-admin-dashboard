import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Completed",
        "Dispatched",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentDetails: {
      method: { type: String, default: "Card" }, // Card, COD, etc.
      transactionId: { type: String }, // Stripe/PayPal/COD reference
      paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid",
      },
    },
    dispatchDetails: {
      dispatchedBy: { type: String }, // Admin ID or name
      dispatchedAt: { type: Date },
      deliveryEstimate: { type: Date },
    },
    cancellationReason: {
      type: String,
      default: null, // Reason for order cancellation
    },
    orderHistory: [
      {
        status: {
          type: String,
          enum: [
            "Pending",
            "Completed",
            "Dispatched",
            "Shipped",
            "Delivered",
            "Cancelled",
          ],
        },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String }, // Optional note for each status update
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
