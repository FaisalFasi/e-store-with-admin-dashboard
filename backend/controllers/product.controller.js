import mongoose from "mongoose";
import redis from "../db/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import fs from "fs/promises";
import { imageValidationHelper } from "../helpers/validationHelper/imageValidationHelper.js";
import ProductVariation from "../models/productVariation.model.js";
import { get_uuid } from "../utils/uuidGenerator.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import {
  createProductVariations,
  generateSlug,
  processVariations,
} from "../helpers/productHelpers/createProductHelper.js";
import { handleError } from "../utils/handleError/handleError.js";
import { __getRecommendedProducts } from "../helpers/productHelpers/recommendationHelper.js";

export const createProduct = async (req, res) => {
  const session = await mongoose.startSession(); // Start a transaction
  session.startTransaction();

  try {
    const {
      name,
      description,
      category,
      basePrice,
      stock,
      status = "draft",
      tags = [],
      additionalDetails = {},
      discounts = [],
      isFeatured = false,
      metaTitle,
      metaDescription,
    } = req.body;

    const parsedCategory = JSON.parse(category);

    // Validate required fields
    if (!name || !parsedCategory?.parent || !basePrice || stock === undefined) {
      return res.status(400).json({
        message:
          "Missing required fields: name, category.parent, basePrice, stock",
      });
    }

    // Validate category structure
    if (!mongoose.Types.ObjectId.isValid(parsedCategory.parent)) {
      return res.status(400).json({ message: "Invalid parent category ID" });
    }

    // Process files
    const requestedFiles = req.files || [];
    const validImage = imageValidationHelper(requestedFiles);
    if (!validImage.valid) {
      return res.status(400).json({ message: validImage.message });
    }

    const variations = JSON.parse(req.body.variations);

    // Process variations and upload images
    const processedVariations = await processVariations(
      variations,
      requestedFiles
    );

    const productData = {
      name,
      slug: generateSlug(name),
      description: description || "",
      category: {
        parent: parsedCategory.parent,
        child: parsedCategory.child || null,
        grandchild: parsedCategory.grandchild || null,
      },
      basePrice: parseFloat(basePrice),
      stock: parseInt(stock),
      status,
      tags: tags.slice(0, 10), // Enforce max 10 tags
      additionalDetails,
      discounts: discounts.map((d) => ({
        type: d.type,
        value: parseFloat(d.value),
        expiry: d.expiry ? new Date(d.expiry) : null,
      })),
      isFeatured,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
    }; // Handle featured image

    if (requestedFiles.featuredImage) {
      const featuredImage = await uploadToCloudinary(
        [requestedFiles.featuredImage],
        "products/featured"
      );
      productData.featuredImage = featuredImage[0];
    }

    const product = new Product(productData);
    await product.save({ session });

    // Process and link variations
    if (variations.length > 0) {
      const { variationIds, defaultVariationId } =
        await createProductVariations(
          product._id,
          processedVariations,
          session
        );

      product.variations = variationIds;
      product.defaultVariation = defaultVariationId;
      await product.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Return created product with populated fields
    const createdProduct = await Product.findById(product._id)
      .populate("variations")
      .populate("category.parent")
      .populate("category.child")
      .populate("category.grandchild");

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      createProduct: product,
      product: createdProduct,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, error, "createProduct");
  }
};

// Enhanced getHomepageProducts
export const getHomepageProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: "active" };
    if (category) {
      query["category.parent"] = new mongoose.Types.ObjectId(category);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort(sort)
        .populate("defaultVariation", "price imageUrls")
        .populate("category.parent", "name slug")
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products: products.map((p) => ({
        ...p,
        price: p.basePrice,
        discount: p.discounts[0] || null,
      })),
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    handleError(res, error, "getHomepageProducts");
  }
};

// Enhanced getAllProducts
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "draft",
    })
      .populate(
        "category.parent category.child category.grandchild",
        "name slug"
      )
      .populate({
        path: "variations",
        populate: {
          path: "colors.sizes",
          model: "ProductVariation",
        },
      });

    res.json({ success: true, products });
  } catch (error) {
    handleError(res, error, "getAllProducts");
  }
};

//   getProductById
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category.parent category.child category.grandchild")
      .populate({
        path: "variations",
        populate: {
          path: "colors.sizes",
          model: "ProductVariation",
        },
      })
      .populate("reviews"); // Ensure Review model is registered

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error in getProductById:", error);
    handleError(res, error, "getProductById");
  }
};

// Enhanced getFeaturedProducts
export const getFeaturedProducts = async (req, res) => {
  try {
    const cacheKey = "featured_products";
    let featuredProducts = await redis.get(cacheKey);

    if (!featuredProducts) {
      featuredProducts = await Product.find({
        isFeatured: true,
        status: "draft",
      })
        .populate(
          "category.parent category.child category.grandchild",
          "name slug"
        )
        .populate({
          path: "variations",
          model: "ProductVariation", // Double-check model name

          populate: {
            path: "colors.sizes",
            model: "ProductVariation",
          },
        })
        .lean();
      console.log("featuredProducts", featuredProducts);

      await redis.set(cacheKey, JSON.stringify(featuredProducts), "EX", 3600);
    } else {
      // Parse cached data
      featuredProducts = JSON.parse(featuredProducts);
    }

    res.status(200).json({ success: true, products: featuredProducts });
  } catch (error) {
    handleError(res, error, "getFeaturedProducts");
  }
};

// Enhanced getRecommendedProducts
export const getRecommendedProducts = async (req, res) => {
  __getRecommendedProducts(req, res);
};

// Cache invalidation helper (call this when products change)
export const invalidateCategoryRecommendations = async (categoryId) => {
  const cacheKey = `recs:cat:${categoryId}`;
  await redis.del(cacheKey);
  console.log(`Invalidated recommendations for category ${categoryId}`);
};

// Enhanced getProductByCategory
export const getProductByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({
      $or: [
        { "category.parent": categoryId },
        { "category.child": categoryId },
        { "category.grandchild": categoryId },
      ],
    }).populate("defaultVariation", "price imageUrls");

    res.json({ success: true, products });
  } catch (error) {
    handleError(res, error, "getProductByCategory");
  }
};

// Enhanced toggleFeaturedProduct
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    product.isFeatured = !product.isFeatured;
    await product.save();

    // Update cache
    const featuredProducts = await Product.find({ isFeatured: true })
      .populate("defaultVariation", "price imageUrls")
      .lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json({ success: true, product });
  } catch (error) {
    handleError(res, error, "toggleFeaturedProduct");
  }
};

// Enhanced updateDiscount
export const updateDiscount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, discountType, value, expiry } = req.body;
    const product = await Product.findById(productId).session(session);

    if (!product) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const newDiscount = {
      type: discountType,
      value: Number(value),
      expiry: expiry ? new Date(expiry) : null,
    };

    product.discounts.push(newDiscount);
    await product.save({ session });
    await session.commitTransaction();

    res.json({ success: true, product });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, "updateDiscount");
  } finally {
    session.endSession();
  }
};

// Enhanced deleteProduct
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(req.params.id).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete associated images from Cloudinary
    const deletePromises = [];

    // 1. Delete featured image
    if (product.featuredImage?.public_id) {
      deletePromises.push(
        cloudinary.uploader.destroy(product.featuredImage.public_id)
      );
    }

    // 2. Delete variation images
    const variations = await ProductVariation.find({
      productId: product._id,
    }).session(session);

    variations.forEach((variation) => {
      variation.colors.forEach((color) => {
        color.imageUrls.forEach((image) => {
          // Extract public_id from Cloudinary URL
          const urlParts = image.split("/");
          const publicId = urlParts.slice(-2).join("/").split(".")[0];

          deletePromises.push(cloudinary.uploader.destroy(publicId));
        });
      });
    });

    // 3. Delete all related variations
    deletePromises.push(
      ProductVariation.deleteMany({ productId: product._id }).session(session)
    );

    // 4. Delete the product itself
    deletePromises.push(product.deleteOne({ session }));

    // Execute all deletions
    await Promise.all(deletePromises);
    await session.commitTransaction();

    await invalidateCategoryRecommendations(
      product.category.grandchild ||
        product.category.child ||
        product.category.parent
    );

    res.json({
      success: true,
      message: "Product and all associated data deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, "deleteProduct");
  } finally {
    session.endSession();
  }
};
