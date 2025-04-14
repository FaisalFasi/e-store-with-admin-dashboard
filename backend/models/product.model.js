import mongoose from "mongoose";
import Category from "./category.model.js";

const productSchema = new mongoose.Schema(
  {
    // Basic Product Info (Optimized)
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: "text",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    brand: { type: String, trim: true, index: true },

    // ✅ **Flexible 4-Level Category (1-4 levels supported)**
    category: {
      l1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      }, // Parent (required)
      l2: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Child (optional)
      l3: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Grandchild (optional)
      l4: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Great-Grandchild (optional)
    },
    isFeatured: { type: Boolean, default: false }, // Featured product flag
    // Pricing (Structured for precision)
    price: {
      basePrice: {
        type: Number,
        required: true,
        min: 0,
        set: (v) => Math.round(v * 100), // Store in cents/paisa
      }, // Store in smallest unit (cents/paisa)
      currency: { type: String, default: "USD", enum: ["USD", "EUR", "PKR"] },
      discount: { type: Number, min: 0, max: 100, default: 0 }, // Percentage (0-100)
    },

    // Inventory (Optimized)
    totalStock: { type: Number, min: 0, index: true },
    // Status & Metadata
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    variations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariation",
      },
    ],
    defaultVariation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
    },

    images: {
      type: [String],
    },

    tags: [{ type: String, lowercase: true, maxlength: 30 }],
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },

    ratings: {
      average: { type: Number, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true, toJSON: { virtuals: true } } // Enable virtuals
);

// 🚀 **Virtual for Category Path (e.g., "Electronics > Phones > Smartphones")**
productSchema.virtual("categoryPath").get(async function () {
  const cats = await Category.find({
    _id: {
      $in: [
        this.category.l1,
        this.category.l2,
        this.category.l3,
        this.category.l4,
      ],
    },
  });
  const path = cats
    .map((c) => c.name)
    .filter(Boolean)
    .join(" > ");
  return path || "Uncategorized";
});

// 🔥 **Indexes (Max Query Performance)**
productSchema.index({ "category.l1": 1, status: 1 }); // Fast filtering by top-level category
productSchema.index({ "category.l2": 1, status: 1 }); // Fast filtering by 2nd level
productSchema.index({ "category.l3": 1, status: 1 }); // Fast filtering by 3rd level
productSchema.index({ "category.l4": 1, status: 1 }); // Fast filtering by 4th level
productSchema.index({ name: 1, status: 1 }); // Fast filtering by name
// images order index
productSchema.index({ "images.order": 1 }); // Fast sorting by image order
productSchema.index({ name: "text", description: "text" });

// ✅ **Validation (Ensures Correct Nesting)**
productSchema.pre("save", async function (next) {
  if (this.category.l2) {
    const parent = await Category.findById(this.category.l2);
    if (
      !parent ||
      parent.parentCategory.toString() !== this.category.l1.toString()
    ) {
      throw new Error("Category L2 must be a child of L1");
    }
  }
  if (this.category.l3) {
    const parent = await Category.findById(this.category.l3);
    if (
      !parent ||
      parent.parentCategory.toString() !== this.category.l2.toString()
    ) {
      throw new Error("Category L3 must be a child of L2");
    }
  }
  if (this.category.l4) {
    const parent = await Category.findById(this.category.l4);
    if (
      !parent ||
      parent.parentCategory.toString() !== this.category.l3.toString()
    ) {
      throw new Error("Category L4 must be a child of L3");
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
