import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  value: { type: String, required: true }, // Can be "S", "M", "L", "XL", or "30", "34", "36", etc.
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 }, // Price for this specific size
  sku: { type: String, required: true, unique: true }, // Unique SKU for this size
  barcode: { type: String, unique: true, sparse: true }, // Unique barcode for this size
  isInStock: {
    type: Boolean,
    default: function () {
      return this.quantity > 0;
    },
  },
  // imageUrls: { type: [String] }, // Optional: Images specific to this size
});

// Schema for color variations
const colorSchema = new mongoose.Schema({
  color: { type: String, required: true },
  name: { type: String, required: true }, // Example: "Red", "Blue"
  sizes: [sizeSchema], // Array of sizes for this color
  imageUrls: { type: [String], required: true }, // Images specific to this color
  isDefault: { type: Boolean, default: false }, // Is this the default color?
});

// Schema for product variations
const variationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to the Product model
      required: true,
    },
    colors: [colorSchema], // Array of colors for this product
    metadata: {
      type: Map, // Flexible key-value pairs for additional attributes (e.g., material, weight)
      of: String,
    },
  },
  { timestamps: true }
);

// Middleware to generate SKUs for sizes
variationSchema.pre("save", function (next) {
  this.colors.forEach((color) => {
    color.sizes.forEach((size) => {
      if (!size.sku) {
        size.sku = `${this.productId}-${color.name}-${size.value}`;
      }
    });
  });
  next();
});
variationSchema.index({ productId: 1 });
variationSchema.index({ "colors.name": 1 });

const ProductVariation = mongoose.model("ProductVariation", variationSchema);
export default ProductVariation;
