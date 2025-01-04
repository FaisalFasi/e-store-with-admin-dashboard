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
    // i need sku for the cart page bcz i need to know which product i am adding to the cart and sku will store the product id and the variation id
    sku: {
      type: String, // Unique identifier for this variation
      required: true,
      unique: true,
    },
    images: {
      type: [String], // Array of image URLs
      required: true,
    },
  },
  { timestamps: true }
);

const Variation = mongoose.model("Variation", variationSchema);
export default Variation;
