// create category model

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      validate: {
        validator: (v) =>
          v === "" || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
        message: "Invalid image URL format",
      },
    },

    //   When to use: Only provide this if your category is a child of a category. If it's a top-level category, leave it out or set it to null (which is the default).
    // parentCategory: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    //   default: null, // for top-level categories
    // },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    depth: { type: Number, default: 0, min: 0, max: 3 }, // 0=L1, 1=L2, 2=L3, 3=L4
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
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ status: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ depth: 1 });
categorySchema.index({ createdAt: -1 });
categorySchema.index({ updatedAt: -1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
