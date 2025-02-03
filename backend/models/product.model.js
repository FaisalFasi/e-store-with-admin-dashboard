import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      maxLength: 2000,
      // Custom error message for exceeding max length
      validate: {
        validator: function (v) {
          return v.length <= 2000;
        },
        message: (props) =>
          `${props.value} exceeds the limit of 2000 characters!`,
      },
    },
    category: {
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
      },
      grandchild: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
      },
    },
    defaultVariation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation", // Reference to the Variation model
    },
    variations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariation",
      },
    ],

    tags: {
      type: [String], // Example: ["electronics", "smartphone", "gaming"]
    },
    additionalDetails: {
      type: Map,
      of: String, // Flexible key-value pair for additional product info like brand, material
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number, // Discount percentage (e.g., 10 for 10%)
      min: 0,
      max: 100,
    },
    discountExpiry: {
      type: Date, // Optional expiry date for the discount
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Middleware to delete variations when a product is deleted
productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      console.log(`Deleting variations for product: ${this._id}`);
      await ProductVariation.deleteMany({ productId: this._id });
      next();
    } catch (error) {
      next(error);
    }
  }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ "category.parent": 1 });
productSchema.index({ "category.child": 1 });
productSchema.index({ "category.grandchild": 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
