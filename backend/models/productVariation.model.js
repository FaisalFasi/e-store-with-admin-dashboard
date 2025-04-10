import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true,
    uppercase: true, // ➡️ Ensures "S" vs "s" consistency
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    index: true, // ➡️ Faster stock-level queries
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => Math.round(v * 100), // Store in cents/paisa
    },

    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "GBP", "PKR"], // Match your product currency options
      default: "USD",
    },
  },

  sku: {
    type: String,
    required: true,
    unique: true,
    immutable: true, // ➡️ Prevent accidental updates
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  isInStock: {
    type: Boolean,
    default: function () {
      return this.quantity > 0;
    },
  },
  // ➡️ Added image reference (optional)
  imageRef: {
    type: String,
    match: /\.(jpg|jpeg|png|webp)$/i, // Validate image format
  },
});

const colorSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    trim: true,
  },
  colorName: {
    type: String,
    required: true,
    trim: true,
    index: true, // ➡️ Faster color-based filtering
  },
  sizes: [sizeSchema],
  imageUrls: {
    type: [String],
    required: true,
    validate: [(val) => val.length > 0, "At least one image is required"], // ➡️ Ensures non-empty array
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  // ➡️ Added hex code for UI consistency
  hexCode: {
    type: String,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Validate hex color
  },
});

const variationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true, // ➡️ Faster product-based lookups
    },
    colors: [colorSchema],
    metadata: {
      type: Map,
      of: String,
    },
    // ➡️ Track variation status (e.g., "active", "discontinued")
    status: {
      type: String,
      enum: ["active", "discontinued", "draft"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // ➡️ Enable virtuals in API responses
  }
);

// ➡️ Improved SKU generation (more collision-resistant)
variationSchema.pre("save", function (next) {
  const productPrefix = this.productId.toString().slice(-5); // Last 5 chars of ID
  this.colors.forEach((color) => {
    color.sizes.forEach((size) => {
      if (!size.sku) {
        size.sku = `${productPrefix}-${color.name.slice(0, 3)}-${
          size.value
        }`.toUpperCase();
      }
    });
  });
  next();
});

// ➡️ Auto-update isInStock when quantity changes
sizeSchema.pre("save", function (next) {
  this.isInStock = this.quantity > 0;
  next();
});

// Indexes for critical queries
variationSchema.index({ productId: 1, status: 1 }); // Find active variations for a product
variationSchema.index({ "colors.name": 1, status: 1 }); // Filter by color name
variationSchema.index({ "colors.sizes.value": 1 }); // Find products by size

const ProductVariation = mongoose.model("ProductVariation", variationSchema);
export default ProductVariation;
