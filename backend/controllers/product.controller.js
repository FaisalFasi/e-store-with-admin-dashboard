import mongoose from "mongoose";
import redis from "../db/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

import { imageValidationHelper } from "../helpers/validationHelper/imageValidationHelper.js";
import ProductVariation from "../models/productVariation.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import {
  createProductVariations,
  generateSlug,
  processVariations,
} from "../helpers/productHelpers/createProductHelper.js";
import { handleError } from "../utils/handleError/handleError.js";
import { __getRecommendedProducts } from "../helpers/productHelpers/recommendationHelper.js";
import Category from "../models/category.model.js";

export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. INPUT EXTRACTION AND VALIDATION =============================
    const {
      name,
      description,
      category,
      price,
      stock,
      status = "draft",
      tags = [],
      additionalDetails = {},
      isFeatured = false,
      metaTitle = "",
      metaDescription = "",
      brand,
      variations: variationsInput = [],
    } = req.body;

    const requestedFiles = req.files || [];

    // Validate required fields
    if (!name || !category || !brand || !price || !stock || !requestedFiles) {
      return handleError(res, "All fields are required", "createProduct", 400);
    }

    // 2. DATA PARSING AND VALIDATION =================================
    // Parse and validate category
    let parsedCategory;
    try {
      parsedCategory = JSON.parse(category);
      console.log("Parsed category:", parsedCategory);
      if (!parsedCategory?.l1) {
        return handleError(
          res,
          "At least level 1 category (l1) is required",
          "createProduct",
          400
        );
      }
    } catch (e) {
      return handleError(res, "Invalid category format", "createProduct", 400);
    }

    // Validate category hierarchy
    await validateCategoryHierarchy(parsedCategory, session);

    // Parse and validate price
    let parsedPrice;
    try {
      parsedPrice = JSON.parse(price);

      if (!parsedPrice?.basePrice) {
        return handleError(res, "Base price is required", "createProduct", 400);
      }
    } catch (e) {
      return handleError(res, "Invalid price format", "createProduct", 400);
    }

    // Validate images
    const { valid, message } = imageValidationHelper(requestedFiles);
    if (!valid) {
      return handleError(res, message, "createProduct", 400);
    }

    // 3. DATA PREPARATION ============================================
    // Base product data
    const productData = {
      name,
      slug: generateSlug(name),
      description: description || "",
      brand: brand || undefined,
      category: {
        l1: parsedCategory.l1,
        l2: parsedCategory.l2 || undefined,
        l3: parsedCategory.l3 || undefined,
        l4: parsedCategory.l4 || undefined,
      },
      variations: [],
      defaultVariation: null,
      price: {
        basePrice: parseFloat(parsedPrice.basePrice), // Store in cents
        currency: parsedPrice.currency || "USD",
        discount: parsedPrice.discount || 0,
      },
      //  parseInt will convert string to number
      // and if it is not a number then it will return NaN
      totalStock: parseInt(stock, 10) || 0,
      status,
      tags: [...new Set(tags.slice(0, 10))], // Deduplicate and limit tags
      additionalDetails,
      isFeatured,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
    };

    // Process and upload main product images
    if (requestedFiles.images) {
      const imagesToUpload = Array.isArray(requestedFiles.images)
        ? requestedFiles.images
        : [requestedFiles.images];

      const uploadedImages = await uploadToCloudinary(
        imagesToUpload,
        "products/images-main"
      );

      productData.images = uploadedImages.map((img, index) => ({
        url: img.url,
        alt: `${name} image ${index + 1}`,
        order: index,
      }));
    }

    // 4. DATABASE OPERATIONS =========================================
    // Create the base product
    const product = new Product(productData);
    await product.save({ session });

    // Process variations if they exist
    if (variationsInput.length > 0) {
      let parsedVariations;
      try {
        parsedVariations = JSON.parse(variationsInput);
      } catch (e) {
        handleError(res, "Invalid variations format", "createProduct", 400);
        return;
      }

      // Process variations (upload images, validate structure)
      const processedVariations = await processVariations(
        parsedVariations,
        requestedFiles
      );

      // Create variations in database
      const { variationIds, defaultVariationId } =
        await createProductVariations(
          product._id,
          processedVariations,
          product.price.currency,
          session
        );

      // Update product with variation references
      product.variations = variationIds;
      product.defaultVariation = defaultVariationId;
      await product.save({ session });
    }

    // 5. FINAL RESPONSE PREPARATION ==================================
    const createdProduct = await Product.findById(product._id)
      .populate({
        path: "variations",
        populate: { path: "colors.sizes" },
      })
      .populate("category.l1 category.l2 category.l3 category.l4")
      .session(session);

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      product: createdProduct,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Product creation failed:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    const statusCode = error.name === "ValidationError" ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: `Product creation failed: ${error.message}`,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  } finally {
    await session.endSession();
  }
};
const validateCategoryHierarchy = async (categoryIds, session) => {
  // 1. Validate each category exists and has correct depth
  const getValidatedCategory = async (id, expectedDepth) => {
    if (!id) return null;

    const cat = await Category.findById(id).session(session);
    if (!cat) throw new Error(`Category ${id} not found`);
    if (cat.depth !== expectedDepth) {
      throw new Error(
        `Category ${id} must be a level ${expectedDepth + 1} category`
      );
    }
    return cat;
  };

  // 2. Check each level
  const l1 = await getValidatedCategory(categoryIds.l1, 0); // Depth 0 = L1
  const l2 = await getValidatedCategory(categoryIds.l2, 1); // Depth 1 = L2
  const l3 = await getValidatedCategory(categoryIds.l3, 2); // Depth 2 = L3
  const l4 = await getValidatedCategory(categoryIds.l4, 3); // Depth 3 = L4

  // 3. Verify parent-child relationships
  if (l2 && l2.parentCategory?.toString() !== l1?._id.toString()) {
    throw new Error(`L2 category must be a child of the selected L1 category`);
  }
  if (l3 && l3.parentCategory?.toString() !== l2?._id.toString()) {
    throw new Error(`L3 category must be a child of the selected L2 category`);
  }
  if (l4 && l4.parentCategory?.toString() !== l3?._id.toString()) {
    throw new Error(`L4 category must be a child of the selected L3 category`);
  }

  // 4. Return validated IDs
  return {
    l1: l1?._id,
    l2: l2?._id || undefined,
    l3: l3?._id || undefined,
    l4: l4?._id || undefined,
  };
};
export const getHomepageProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: "active" };
    if (category) {
      query["category.l1"] = new mongoose.Types.ObjectId(category);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort(sort)
        .populate("defaultVariation", "price imageUrls")
        .populate("category.l1", "name slug")
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
      status: "active",
    })
      .populate("category.l1 category.l2 category.l3 category.l4", "name slug")
      .populate({
        path: "variations",
        populate: {
          path: "colors.sizes",
          model: "ProductVariation",
        },
      });
    res.json({ success: true, products });
  } catch (error) {
    handleError(res, error, "getAllProducts", 500);
  }
};

//   getProductById
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category.l1 category.l2 category.l3 category.l4")
      .populate({
        path: "variations",
        populate: {
          path: "colors.sizes",
          model: "ProductVariation",
        },
      })
      .populate({
        path: "reviews",
        model: "Review",
      });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error in getProductById:", error);
    handleError(res, error, "getProductById", 500);
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
        status: "active",
      })
        .populate([
          {
            path: "category.l1 category.l2 category.l3 category.l4",
            select: "name slug",
          },
          {
            path: "variations",
            model: "ProductVariation",
          },
          {
            path: "defaultVariation",
            model: "ProductVariation",
            select: "price imageUrls",
          },
        ])
        .lean();

      // Save to Redis
      await redis.set(cacheKey, JSON.stringify(featuredProducts), "EX", 3600);
    } else {
      // Parse and manually populate variations
      featuredProducts = JSON.parse(featuredProducts);

      for (let product of featuredProducts) {
        if (product.variations && product.variations.length) {
          const fullVariations = await ProductVariation.find({
            _id: { $in: product.variations },
          }).lean();

          product.variations = fullVariations;
        }

        if (product.defaultVariation) {
          const defaultVar = await ProductVariation.findById(
            product.defaultVariation
          ).lean();
          product.defaultVariation = defaultVar;
        }
      }
    }

    res.status(200).json({ success: true, products: featuredProducts });
  } catch (error) {
    handleError(res, error, "getFeaturedProducts");
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

export const getRecommendedProducts = async (req, res) => {
  __getRecommendedProducts(req, res);
};

// Cache invalidation helper (call this when products change)
export const invalidateCategoryRecommendations = async (categoryId) => {
  const cacheKey = `recs:cat:${categoryId}`;
  await redis.del(cacheKey);
};

// Enhanced getProductByCategory
export const getProductByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({
      $or: [
        { "category.l1": categoryId },
        { "category.l2": categoryId },
        { "category.l3": categoryId },
        { "category.l4": categoryId },
      ],
    }).populate("defaultVariation", "price imageUrls");

    res.json({ success: true, products });
  } catch (error) {
    handleError(res, error, "getProductByCategory");
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

    // Store whether the product was featured (for cache invalidation)
    const wasFeatured = product.isFeatured;

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
      product.category.l4 ||
        product.category.l3 ||
        product.category.l2 ||
        product.category.l1
    );

    // ✅ Only remove from Redis if the product was featured
    if (wasFeatured) {
      const cacheKey = "featured_products";
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        const featuredProducts = JSON.parse(cachedData);
        const updatedProducts = featuredProducts.filter(
          (p) => p._id !== product._id.toString()
        );

        if (updatedProducts.length < featuredProducts.length) {
          await redis.set(
            cacheKey,
            JSON.stringify(updatedProducts),
            "EX",
            3600
          );
        }
      }
    }

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
