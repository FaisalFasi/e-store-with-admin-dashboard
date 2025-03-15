import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // User Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Products in the Order
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
        color: {
          type: String,
        },
        size: {
          type: String,
        },
        variation: {
          type: String,
        },
        // variation: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "ProductVariation", // Link to the specific product variation (e.g., size, color)
        // },
      },
    ],

    // Order Summary
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Order Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Payment Confirmed",
        "Processing",
        "Dispatched",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
    },

    // Payment Details
    paymentDetails: {
      method: {
        type: String,
        enum: ["Card", "COD", "PayPal", "Stripe", "Bank Transfer"],
        default: "Card",
      },
      transactionId: { type: String },
      paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "failed", "refunded"],
        default: "unpaid",
      },
      paymentDate: { type: Date },
    },

    // Shipping and Dispatch Details
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: false },
    },
    dispatchDetails: {
      dispatchedBy: { type: String },
      dispatchedAt: { type: Date },
      deliveryEstimate: { type: Date },
      trackingNumber: { type: String },
      carrier: { type: String },
    },

    // Cancellation and Refund Details
    cancellationReason: { type: String },
    refundDetails: {
      refundAmount: { type: Number, min: 0 },
      refundDate: { type: Date },
      refundReason: { type: String },
    },

    // Order History
    orderHistory: [
      {
        status: {
          type: String,
          enum: [
            "Pending",
            "Payment Confirmed",
            "Processing",
            "Dispatched",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Refunded",
          ],
        },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String }, // Additional notes for this status change
      },
    ],

    // Stripe Integration
    stripeSessionId: { type: String, unique: true, sparse: true }, // Optional for non-Stripe payments

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for common queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 }, { unique: true, sparse: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
