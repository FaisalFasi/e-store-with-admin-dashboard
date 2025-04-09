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

    // Pricing (Structured for precision)
    price: {
      base: { type: Number, required: true, min: 0 }, // Store in smallest unit (cents/paisa)
      currency: { type: String, default: "USD", enum: ["USD", "EUR", "PKR"] },
      discount: { type: Number, min: 0, max: 100 }, // Percentage (0-100)
    },

    // Inventory (Optimized)
    stock: { type: Number, required: true, min: 0, index: true },
    sku: { type: String, unique: true, trim: true },

    // Media (Efficient storage)
    images: [{ url: String, alt: String, order: Number }],

    // Status & Metadata
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    tags: [{ type: String, lowercase: true, maxlength: 30 }],
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
productSchema.index({ name: "text", description: "text", tags: "text" }); // Full-text search

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

// import mongoose from "mongoose";
// import { type } from "os";

// const productSchema = new mongoose.Schema(
//   {
//     // Basic Product Information
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       match: [
//         /^[a-z0-9-]+$/,
//         "Slug must contain only lowercase letters, numbers, and hyphens",
//       ],
//       index: true,
//     },
//     description: {
//       type: String,
//       required: false,
//       maxLength: 2000,
//       validate: {
//         validator: function (v) {
//           return v.length <= 2000;
//         },
//         message: (props) =>
//           `${props.value} exceeds the limit of 2000 characters!`,
//       },
//     },
//     brand: {
//       type: String,
//       trim: true,
//       index: true,
//       maxlength: 50,
//       validate: {
//         validator: function (v) {
//           return v.length <= 50;
//         },
//         message: (props) =>
//           `${props.value} exceeds the limit of 50 characters!`,
//       },
//     },
//     category: {
//       parent: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         required: true,
//         validate: {
//           validator: async function (v) {
//             const cat = await mongoose.model("Category").findById(v);
//             return cat?.depth === 0; // Must be root category
//           },
//           message: "Parent category must be a top-level category",
//         },
//       },
//       child: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         validate: {
//           validator: async function (v) {
//             if (!v) return true;
//             const cat = await mongoose.model("Category").findById(v);
//             return (
//               cat?.depth === 1 &&
//               cat.parentCategory.equals(this.category.parent)
//             );
//           },
//           message: "Child category must belong to the parent category",
//         },
//       },
//       grandchild: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         validate: {
//           validator: async function (v) {
//             if (!v || !this.category.child) return true;
//             const cat = await mongoose.model("Category").findById(v);
//             return (
//               cat?.depth === 2 && cat.parentCategory.equals(this.category.child)
//             );
//           },
//           message: "Grandchild category must belong to the child category",
//         },
//       },
//       greatGrandchild: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         validate: {
//           validator: async function (v) {
//             if (!v || !this.category.grandchild) return true;
//             const cat = await mongoose.model("Category").findById(v);
//             return (
//               cat?.depth === 3 &&
//               cat.parentCategory.equals(this.category.grandchild)
//             );
//           },
//           message:
//             "Great-grandchild category must belong to the grandchild category",
//         },
//       },
//     },
//     // category: {
//     //   parent: {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "Category",
//     //     required: true,
//     //   },
//     //   child: {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "Category",
//     //     required: false,
//     //   },
//     //   grandchild: {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "Category",
//     //     required: false,
//     //   },
//     //   greatGrandchild: {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "Category",
//     //     required: false,
//     //   }, // New 4th level
//     // },

//     // Variations (Sizes, Colors, etc.)
//     defaultVariation: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ProductVariation",
//     },
//     variations: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "ProductVariation",
//       },
//     ],

//     // Tags and Metadata
//     tags: {
//       type: [
//         {
//           type: String,
//           trim: true,
//           lowercase: true,
//           maxlength: 30,
//         },
//       ],
//       validate: [
//         {
//           validator: function (v) {
//             return v.length <= 10;
//           },
//           message: "Cannot have more than 10 tags!",
//         },
//         {
//           validator: function (v) {
//             return new Set(v).size === v.length; // No duplicates
//           },
//           message: "Duplicate tags are not allowed!",
//         },
//       ],
//     },

//     additionalDetails: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed, // Flexible key-value pairs for additional product info
//     },

//     pricing: {
//       basePrice: {
//         type: Number,
//         required: true,
//         min: 0,
//         get: (v) => (v / 100).toFixed(2), // Store in cents, display in dollars
//         set: (v) => Math.round(v * 100), // Convert dollars to cents
//       },
//       currency: {
//         type: String,
//         default: "USD",
//         enum: ["USD", "EUR", "GBP", "PKR"],
//         uppercase: true,
//       },
//       discounts: [
//         {
//           type: {
//             type: String,
//             enum: ["percentage", "fixed"],
//             required: true,
//           },
//           value: {
//             type: Number,
//             required: true,
//             min: 0,
//             max: function () {
//               return this.type === "percentage" ? 100 : Infinity;
//             },
//           },
//           expiry: {
//             type: Date,
//             validate: {
//               validator: function (v) {
//                 return !v || v > Date.now();
//               },
//               message: "Discount must expire in the future",
//             },
//           },
//           code: {
//             type: String,
//             trim: true,
//             uppercase: true,
//           },
//         },
//       ],
//     },

//     // Inventory and Status
//     stock: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     status: {
//       type: String,
//       enum: ["draft", "active", "inactive", "archived"], // Added "archived" status
//       default: "draft",
//     },

//     // SEO and Marketing
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     metaTitle: {
//       type: String,
//       trim: true,
//     },
//     metaDescription: {
//       type: String,
//       trim: true,
//     },

//     // Reviews and Ratings
//     reviews: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Review",
//       },
//     ],
//     ratings: {
//       average: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 5,
//       },
//       count: {
//         type: Number,
//         default: 0,
//         min: 0,
//       },
//     },

//     // Timestamps
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

// // Middleware to delete variations and reviews when a product is deleted
// productSchema.pre(
//   "deleteOne",
//   { document: true, query: false },
//   async function (next) {
//     try {
//       console.log(`Deleting variations and reviews for product: ${this._id}`);
//       await ProductVariation.deleteMany({ productId: this._id });
//       await Review.deleteMany({ productId: this._id });
//       next();
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // Indexes for common queries
// productSchema.index({ createdAt: -1 });
// productSchema.index({ name: "text", description: "text" });
// productSchema.index({ isFeatured: 1 });
// productSchema.index({ tags: 1 });
// productSchema.index({ "discounts.expiry": 1 });
// productSchema.index({ status: 1 });
// productSchema.index({ "ratings.average": -1 });
// productSchema.index({ "category.parent": 1, status: 1 });
// productSchema.index({ "category.child": 1, status: 1 });
// productSchema.index({ "category.grandchild": 1, status: 1 });

// const Product = mongoose.model("Product", productSchema);
// export default Product;
