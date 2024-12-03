import mongoose from "mongoose";
import redis from "../db/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

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
  try {
    const featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json({ products: JSON.parse(featuredProducts) });
    }

    // .lean method is used to convert the Mongoose document into a plain JavaScript object, good for caching and performance
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // Fetch all featured products from the database

    if (!featuredProducts) {
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
  const {
    name,
    price,
    description,
    image: images,
    category,
    isFeatured,
  } = req.body;
  if (!images || images.length === 0) {
    return res.status(400).json({ error: "At least one image is required" });
  }
  // Validate file types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  for (let i = 0; i < images.length; i++) {
    const fileType = images[i].type;
    if (!allowedMimeTypes.includes(fileType)) {
      return res.status(400).json({
        error: `Invalid file type for image ${
          i + 1
        }. Please upload PNG, JPEG, or WEBP files.`,
      });
    }
  }

  try {
    let uploadedImages = null;

    for (let i = 0; i < images.length; i++) {
      const image_ = images[i];
      const cloudinaryResponse = await cloudinary.uploader.upload(image_, {
        folder: "products",
      });
      uploadedImages.push(cloudinaryResponse.secure_url); // Push the image URL to the array
    }

    const product = await Product.create({
      name,
      price,
      description,
      images: uploadedImages?.secure_url || "",
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
  try {
    // aggregate method is used to perform aggregation operations on the database.it will return a random sample of 3 products
    const recommendedProducts = await Product.aggregate([
      { $sample: { size: 4 } },
      { $project: { _id: 1, name: 1, description: 1, price: 1, image: 1 } },
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
