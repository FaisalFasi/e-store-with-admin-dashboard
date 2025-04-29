// create category model

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    image: {
      type: String,
      default: "",
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
      enum: [0, 1, 2, 3], // Only allow depths 0-3 (L1-L4)
    }, // 0=L1, 1=L2, 2=L3, 3=L4
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming you have a User model
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ depth: 1 });

categorySchema.index({ createdAt: -1 });
categorySchema.index({ updatedAt: -1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
