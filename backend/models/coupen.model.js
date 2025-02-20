import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date(); // Ensure expirationDate is in the future
        },
        message: "Expiration date must be in the future",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    maxUsage: {
      type: Number,
      default: 1, // Default to 1 usage per coupon
    },
    usageCount: {
      type: Number,
      default: 0, // Track how many times the coupon has been used
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
