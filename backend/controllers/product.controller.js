import mongoose from "mongoose";
import redis from "../db/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import fs from "fs/promises";
import { imageValidationHelper } from "../helpers/validationHelper/imageValidationHelper.js";
import ProductVariation from "../models/productVariation.model.js";
import { get_uuid } from "../utils/uuidGenerator.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const createProduct = async (req, res) => {
  const session = await mongoose.startSession(); // Start a transaction
  session.startTransaction();

  try {
    const { name, description, category, subCategory } = req.body;

    const variations = JSON.parse(req.body.variations);

    console.log(
      "received data --",
      name,
      description,
      category,
      subCategory,
      variations
    );

    // Assuming `req.files` contains uploaded files (images)
    const requestedFiles = req.files || [];
    console.log("requestedFiles", requestedFiles);

    // validate requestedFiles
    const validImage = imageValidationHelper(requestedFiles);
    console.log("validImage", validImage);
    if (!validImage.valid) {
      return res.status(400).json({ message: validImage.message });
    }

    // Process variations and upload images
    const processedVariations = await Promise.all(
      variations.map(async (variation, index) => {
        // Check required fields
        if (
          !variation.price ||
          !variation.quantity ||
          !variation.color ||
          !variation.size
        ) {
          res.status(404).json({
            message:
              "Price, quantity, color, and size are required for each variation",
          });
        }

        // Filter files for the current variation
        const variationImages = requestedFiles.filter((file) =>
          file.fieldname.startsWith(`variations[${index}].images`)
        );

        // Upload images to Cloudinary

        const uploadedImages = await uploadToCloudinary(
          variationImages,
          "create-products"
        );

        // Attach Cloudinary URLs to the variation
        return {
          ...variation,
          images: uploadedImages, // Store URLs from Cloudinary
        };
      })
    );

    console.log("processedVariations", processedVariations);

    const newProduct = {
      name,
      description,
      category,
      subCategory,
      variations: processedVariations,
    };
    console.log("newProduct", newProduct);

    // Create the product
    const product = await Product.create([newProduct], { session });

    console.log("product", product);
    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Product created successfully!", product });
  } catch (error) {
    console.log("Error in createProduct controller:", error);
  }
};
// export const createProduct = async (req, res) => {
//   const session = await mongoose.startSession(); // Start a transaction
//   session.startTransaction();

//   try {
//     const {
//       name,
//       description,
//       basePrice,
//       category,
//       subCategory,
//       isFeatured = false,
//       discount = 0,
//       tags = [],
//       additionalDetails = {},
//       variations = [], // Array of variation objects (e.g., [{ color, size, quantity, price }])
//     } = req.body;

//     console.log("name", name);
//     // Assuming `req.files` contains uploaded files
//     const requestedFiles = req.files || [];
//     const validImage = imageValidationHelper(requestedFiles);
//     if (!validImage.valid) {
//       return res.status(400).json({ message: validImage.message });
//     }

//     // Upload images to Cloudinary
//     const uploadedImages = await Promise.all(
//       requestedFiles.map(async (file) => {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "products",
//         });
//         // Clean up temporary file
//         await fs.unlink(file.path);

//         return result.secure_url; // Return the URL of the uploaded image
//       })
//     );

//     // Validate and process variations
//     if (variations?.length > 0) {
//       variations?.forEach((variation) => {
//         if (!variation.price || !variation.quantity) {
//           return res.status(400).json({
//             message: "Price and quantity are required for each variation",
//           });
//         }
//       });
//     }

//     const product = await Product.create(
//       {
//         name,
//         description,
//         basePrice,
//         category,
//         subCategory,
//         isFeatured,
//         discount,
//         tags,
//         additionalDetails,
//         images: uploadedImages,
//       },
//       { session }
//     );
//     console.log("default product", product);

//     let createdVariations = [];
//     if (variations && variations.length > 0) {
//       const variationData = variations.map((variation) => ({
//         ...variation,
//         productId: product[0]._id, // Associate the variation with the created product
//         sku: get_uuid(), // Generate a unique SKU for the variation
//       }));

//       createdVariations = await ProductVariation.create(variationData, {
//         session,
//       });
//       console.log("default createdVariations", createdVariations);

//       product.defauldVariation = createdVariations[0]._id;
//     }

//     await product.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       product: product[0],
//       variations: createdVariations,
//       message: "Product and variations created successfully!",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.log("Error in createProduct controller:", error);
//     res.status(500).json({
//       message: "Internal Server Error while creating product",
//       error: error.message,
//     });
//   }
// };

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // Fetch all products from the database and {} means fetch all products

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log("Error in getAllProducts controller:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching products",
      error,
    });
  }
};
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(201).json({ product });
  } catch (error) {
    console.log("Error in getProductById controller:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching product by ID",
      error,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json({ products: JSON.parse(featuredProducts) });
    }

    // .lean method is used to convert the Mongoose document into a plain JavaScript object, good for caching and performance
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // Fetch all featured products from the database

    // If no products are found in the database, return a 404 status
    if (!featuredProducts || featuredProducts.length === 0) {
      return (
        res
          // .status(404)
          .json({ products: {}, message: "No featured products found" })
      );
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json({ products: featuredProducts });
  } catch (error) {
    console.log("Error in getFeaturedProducts controller:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching featured products",
      error,
    });
  }
};

export const getRecommendedProducts = async (req, res) => {
  // aggregate method is used to perform aggregation operations on the database.it will return a random sample of 3 products
  try {
    const recommendedProducts = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          images: 1, // Include all images
          // image: { $arrayElemAt: ["$images", 0] }, // Select the first image
        },
      },
    ]);

    if (!recommendedProducts) {
      return res.status(404).json({ message: "No recommended products found" });
    }

    res.status(200).json({ products: recommendedProducts });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching recommended products",
      error,
    });
  }
};

export const getProductByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const products = await Product.find({ category: category });

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }

    res.json({ products });
  } catch (error) {
    console.log("Error in getProductByCategory controller:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching products by category",
      error,
    });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache(updatedProduct);
      res.json({ updatedProduct });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller:", error);
    res.status(500).json({
      message: "Internal Server Error while toggling featured product",
      error,
    });
  }
};
export const updateDiscount = async (req, res) => {
  const { productId, discount, discountExpiry } = req.body;

  try {
    // Validate the discount (should be a number between 0 and 100)
    if (discount < 0 || discount > 100) {
      return res.status(400).json({ message: "Invalid discount value." });
    }

    // Find the product and update the discount
    const product = await Product.findByIdAndUpdate(
      productId,
      { discount, discountExpiry },
      { new: true } // Return the updated product
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({
      product,
      message: "Product discount updated successfully!",
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateFeaturedProductsCache = async (updatedProduct) => {
  try {
    // lean method is used to convert the Mongoose document into a plain JavaScript object, good for caching and performance
    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updateFeaturedProductsCache:", error);
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.imageUrl) {
      // pop method is used to remove the last element from the array and return that element. example URL: https://res.cloudinary.com/dx3w7xvsv/image/upload/v1633661234/products/abc.jpg , here it will return abc
      const publicId = product.imageUrl.split("/").pop().split(".")[0]; // Extracting the public ID from the image URL
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log(
          "Error in deleteProduct controller while deleting image from Cloudinary:",
          error
        );
        return res.status(500).json({
          message: "Internal Server Error while deleting image from Cloudinary",
          error,
        });
      }
    }
    // Now directly delete the product from the database
    // await Product.findByIdAndDelete(id);

    // Directly delete the fetched product from the database
    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller:", error);
    res.status(500).json({
      message: "Internal Server Error while deleting product",
      error,
    });
  }
};
