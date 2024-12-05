import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    images: {
      type: [String],
      required: [true, "image is required"],
    },
    category: {
      type: String,
      required: [true, "category is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
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

productSchema.index({ name: "text", category: "text" });
const Product = mongoose.model("Product", productSchema);

export default Product;
