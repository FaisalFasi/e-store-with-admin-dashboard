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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true,
    },
    defaultVariation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation", // Reference to the Variation model
    },
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

productSchema.pre("remove", async function (next) {
  await mongoose.model("ProductVariation").deleteMany({ productId: this._id });
  next();
});

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
