import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // Coupon Code
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Ensure the code is stored in uppercase
    },

    // Discount Details
    discountType: {
      type: String,
      enum: ["percentage", "fixed"], // Discount type (percentage or fixed amount)
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          if (this.discountType === "percentage") {
            return value <= 100; // Percentage discount cannot exceed 100%
          }
          return true; // No limit for fixed amount discounts
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },

    // Validity and Usage
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
    maxUsage: {
      type: Number,
      default: 1, // Default to 1 usage per coupon
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0, // Track how many times the coupon has been used
      min: 0,
    },
    maxUsagePerUser: {
      type: Number,
      default: 1, // Limit the number of times a single user can use the coupon
      min: 1,
    },

    // Applicability
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Specific users who can use the coupon (optional)
    minOrderAmount: {
      type: Number,
      min: 0, // Minimum order amount required to use the coupon
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ], // Categories the coupon applies to (optional)
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ], // Specific products the coupon applies to (optional)

    // Timestamps
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

// Indexes for common queries
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ expirationDate: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ userIds: 1 });
couponSchema.index({ applicableCategories: 1 });
couponSchema.index({ applicableProducts: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
