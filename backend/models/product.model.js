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
    basePrice: {
      type: Number, // Default price, optional (can be overridden by variations)
      required: true,
    },
    images: {
      type: [String], // Array of image URLs
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true,
    },
    additionalDetails: {
      type: Map,
      of: String, // Flexible key-value pair for additional product info like brand, material
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       maxLength: 2000,
//     },
//     price: {
//       type: Number,
//       min: 0,
//       required: true,
//     },
//     quantity: { type: Number, required: true, min: 0 }, // Inventory
//     images: {
//       type: [String],
//       required: [true, "image is required"],
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: [true, "category is required"],
//     },
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// productSchema.index({ name: "text" });
// productSchema.index({ category: 1 });
// productSchema.index({ price: 1 });
// productSchema.index({ isFeatured: 1 });

// const Product = mongoose.model("Product", productSchema);

// export default Product;
