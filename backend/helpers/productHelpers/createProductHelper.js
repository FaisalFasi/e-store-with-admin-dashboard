import Product from "../models/productModel.js";
import Variation from "../models/variationModel.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

export const createProduct = async (req, res) => {
  const {
    name,
    basePrice,
    description,
    category,
    isFeatured,
    additionalDetails = {},
    variations = [], // Expecting an array of variation objects (e.g., [{ color, size, quantity, price, sku }])
  } = req.body;

  const requestedFiles = req.files;

  // Validate files
  if (!requestedFiles || requestedFiles.length === 0) {
    return res.status(400).json({ message: "No images uploaded." });
  }

  if (requestedFiles.some((file) => !file.mimetype.startsWith("image"))) {
    return res.status(400).json({ message: "Please upload only images." });
  }

  try {
    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      requestedFiles.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          // Clean up temporary file
          await fs.unlink(file.path);

          return result.secure_url; // Return the URL of the uploaded image
        } catch (error) {
          console.error(`Error uploading ${file.filename}:`, error);
          return res.status(500).json({
            message: "Internal Server Error while uploading images",
            error,
          });
        }
      })
    );

    // Create the product
    const product = await Product.create({
      name,
      basePrice,
      description,
      category,
      isFeatured,
      additionalDetails,
      images: uploadedImages,
    });

    // Create the variations (if provided)
    if (variations && variations.length > 0) {
      const variationData = variations.map((variation) => ({
        ...variation,
        productId: product._id, // Associate the variation with the created product
      }));

      const createdVariations = await Variation.insertMany(variationData);

      return res.status(201).json({
        product,
        variations: createdVariations,
        message: "Product and variations created successfully!",
      });
    }

    res.status(201).json({
      product,
      message: "Product created successfully without variations!",
    });
  } catch (error) {
    console.log("Error in createProduct controller:", error);
    res.status(500).json({
      message: "Internal Server Error while creating product",
      error,
    });
  }
};
