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
        "Payment Confirmed",
        "Completed",
        "Dispatched",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["Card", "COD", "PayPal", "Stripe"],
        default: "Card",
      },
      transactionId: { type: String },
      paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid",
      },
    },
    dispatchDetails: {
      dispatchedBy: { type: String },
      dispatchedAt: { type: Date },
      deliveryEstimate: { type: Date },
    },
    cancellationReason: { type: String, default: null },

    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    orderHistory: [
      {
        status: {
          type: String,
          enum: [
            "Pending",
            "Payment Confirmed",
            "Completed",
            "Dispatched",
            "Shipped",
            "Delivered",
            "Cancelled",
          ],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    stripeSessionId: { type: String, unique: true, required: true }, // Enforces uniqueness

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 }, { unique: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
