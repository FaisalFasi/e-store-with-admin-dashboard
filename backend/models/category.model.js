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
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    //   When to use: Only provide this if your category is a child of another category. If it's a top-level category, leave it out or set it to null (which is the default).
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // for top-level categories
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    // When to use: Only provide this field if you want to set a custom SEO title for the category. If it's not provided, it defaults to an empty string (""), meaning no special title is set.

    metaTitle: {
      type: String,
      default: "",
    },

    // When to use: Similar to metaTitle, you only need to provide this field if you want to set a custom description for search engines. If not provided, it defaults to an empty string ("").

    metaDescription: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming you have a User model
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
