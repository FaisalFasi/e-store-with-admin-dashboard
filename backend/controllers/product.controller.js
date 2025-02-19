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
    const {
      name,
      description,
      isFeatured,
      status,
      category,
      subCategory,
      grandChildCategory,
    } = req.body;

    const variations = JSON.parse(req.body.variations);

    console.log("received data --", req.body);

    // Assuming `req.files` contains uploaded files (images)
    const requestedFiles = req.files || [];

    if (!name || !description || !category) {
      return res
        .status(400)
        .json({ message: "Name, description, and category are required." });
    }

    // validate requestedFiles
    const validImage = imageValidationHelper(requestedFiles);
    if (!validImage.valid) {
      console.log("image is not valid", validImage);
      return res.status(400).json({ message: validImage.message });
    }

    // Process variations and upload images
    const processedVariations = await Promise.all(
      variations?.map(async (variation, index) => {
        // Check required fields
        if (
          !variation.price ||
          !variation.quantity ||
          !variation.color ||
          !variation.size
        ) {
          console.log(" variations all fields are required ", variation);

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
        const uploadedImagesUrls = await uploadToCloudinary(
          variationImages,
          "create-products"
        );

        // Attach Cloudinary URLs to the variation
        return {
          ...variation,
          price: Number(variation.price),
          quantity: Number(variation.quantity),
          imageUrls: uploadedImagesUrls, // Store URLs from Cloudinary
          isDefault: index === 0, // Ensure first variation is default
        };
      })
    );

    console.log("processedVariations", processedVariations);

    const categories_ = {
      parent: category, // Required
      child: subCategory || null, // Optional
      grandchild: grandChildCategory || null, // Optional
    };

    const product = new Product({
      name,
      description,
      category: categories_,
      isFeatured: isFeatured === "true",
      status: status || "draft",
      // tags: tags || [],
      // additionalDetails: additionalDetails || {},
      // discount: discount ? Number(discount) : undefined,
      // discountExpiry: discountExpiry || undefined,
    });

    await product.save({ session });

    let defaultVariationId = null;
    let variationIds = [];

    for (const variationData of processedVariations) {
      const variation = new ProductVariation({
        productId: product._id,
        color: variationData.color,
        size: variationData.size,
        quantity: variationData.quantity,
        price: variationData.price,
        imageUrls: variationData.imageUrls,
        isDefault: variationData.isDefault,
        barcode: variationData?.barcode || undefined,
        sku: `${product._id}-${get_uuid()}`, // Unique SKU
      });
      await variation.save({ session });
      variationIds.push(variation._id);

      if (variation.isDefault) {
        defaultVariationId = variation._id;
      }
    }

    product.variations = variationIds;
    if (defaultVariationId) {
      product.defaultVariation = defaultVariationId;
    }

    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Product created successfully!",
      product: await Product.findById(product._id),
    });
  } catch (error) {
    console.log("Error in createProduct controller:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHomepageProducts = async (req, res) => {
  try {
    console.log("req.query", req.query);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Base query for active products
    const baseQuery = {
      status: "active",
      // isFeatured: false, // Remove if you want all active products
    };

    // how name: 1,  and likewise works in projection ?
    // name: 1,  means that i will get the name of the product
    const projection = {
      name: 1,
      defaultVariation: 1,
      variations: 1,
      category: 1,
      tags: 1,
      discount: 1,
      isFeatured: 1,
      createdAt: 1,
    };

    // Sorting (example: newest first)
    const sort = { createdAt: -1 };

    // what im getting in products and total
    // im getting all the products from the database with the baseQuery
    // im selecting only the fields that are in the projection
    // im sorting the products by createdAt in descending order
    // im skipping the first (page - 1) * limit products
    // im limiting the number of products to the limit
    // im populating the defaultVariation field with the fields price, stock, and imageUrls
    // im converting the Mongoose document into a plain JavaScript object
    // im counting the total number of products
    // im returning the products and total in an array

    const [products, total] = await Promise.all([
      Product.find(baseQuery)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("defaultVariation", "price quantity stock imageUrls") // Only needed fields
        .populate("variations", "price quantity stock imageUrls color size")
        .lean(),
      Product.countDocuments(baseQuery),
    ]);
    console.log("products", products);
    console.log("total", total);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Error in getHomepageProducts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllProducts = async (req, res) => {
  console.log("Fetching all products ---------");
  try {
    const products = await Product.find({})
      .populate({
        path: "variations", // Field to populate
        model: "ProductVariation", // Name of the model you want to populate with
      })
      .populate({
        path: "defaultVariation",
        model: "ProductVariation",
      });

    console.log("products with variations", products);
    res.status(200).json({ success: true, products: [...products] });
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

    const product = await Product.findById(id)
      .populate({
        path: "variations", // Field to populate
        model: "ProductVariation", // Name of the model you want to populate with
      })
      .populate({
        path: "defaultVariation",
        model: "ProductVariation",
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("product", product);
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
