import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      maxLength: 2000,
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
      ref: "ProductVariation",
    },
    variations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariation",
      },
    ],
    tags: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10; // Limit the number of tags to 10
        },
        message: "Cannot have more than 10 tags!",
      },
    },
    additionalDetails: {
      type: Map,
      of: String, // Flexible key-value pairs for additional product info
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discounts: [
      {
        type: {
          type: String,
          enum: ["percentage", "fixed"], // Discount type (percentage or fixed amount)
          required: true,
        },
        value: {
          type: Number,
          required: true,
          min: 0,
        },
        expiry: {
          type: Date, // Optional expiry date for the discount
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"], // Added "archived" status
      default: "draft",
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
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

// Indexes for common queries
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ "discounts.expiry": 1 });
productSchema.index({ status: 1 });
productSchema.index({ "ratings.average": -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
