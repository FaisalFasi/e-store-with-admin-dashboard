import mongoose from "mongoose";
import redis from "../db/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import fs from "fs/promises";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // Fetch all products from the database

    res.json({ products });
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
  console.log(req.body, "Fetching featured products from cache");
  try {
    const featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json({ products: JSON.parse(featuredProducts) });
    }

    // .lean method is used to convert the Mongoose document into a plain JavaScript object, good for caching and performance
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // Fetch all featured products from the database

    // If no products are found in the database, return a 404 status
    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
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

export const createProduct = async (req, res) => {
  const { name, price, description, category, isFeatured } = req.body;

  console.log("req.body:", req.body);
  console.log("req.files:", req.files);

  // Validate files
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images uploaded." });
  }

  try {
    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });

          // Clean up temporary file
          await fs.unlink(file.path);

          return result.secure_url; // Return the URL of the uploaded image
        } catch (error) {
          console.error(`Error uploading ${file.filename}:`, error);
          throw new Error("Failed to upload image to Cloudinary.");
        }
      })
    );

    console.log("uploadedImages:", uploadedImages);

    const product = await Product.create({
      name,
      price,
      description,
      images: uploadedImages,
      category,
      isFeatured,
    });

    res.status(201).json({ product });
  } catch (error) {
    console.log("Error in createProduct controller:", error);
    res.status(500).json({
      message: "Internal Server Error while creating product",
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
    console.log("recommendedProducts:", recommendedProducts);

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
        console.log("Image deleted from Cloudinary");
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
