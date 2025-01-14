import mongoose from "mongoose";

const variationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to the Product model
      required: true,
    },
    color: {
      type: String, // Example: "Red", "Blue"
      required: true,
    },
    size: {
      type: String, // Example: "S", "M", "L", "XL"
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number, // Price for this specific variation
      required: true,
    },
    // stock keeping unit is used to uniquely identify each variation
    sku: {
      type: String, // Unique identifier for this variation
      required: true,
      unique: true,
    },
    images: {
      type: [String], // Array of image URLs
      required: true,
    },
    isInStock: {
      type: Boolean,
      default: function () {
        return this.quantity > 0;
      },
    },
    barcode: {
      type: String, // Unique barcode for this variation
      unique: true,
      sparse: true, // Allow null values if not all variations have barcodes
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
variationSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = `${this.productId}-${this._id}`;
  }
  next();
});

const ProductVariation = mongoose.model("ProductVariation", variationSchema);
export default ProductVariation;
