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

// export const createProduct = async (req, res) => {
//   const session = await mongoose.startSession(); // Start a transaction
//   session.startTransaction();

//   try {
//     const {
//       name,
//       description,
//       category,
//       basePrice: pricing,
//       stock,
//       status = "draft",
//       tags = [],
//       additionalDetails = {},
//       discounts = [],
//       isFeatured = false,
//       metaTitle,
//       metaDescription,
//       brand,
//     } = req.body;

//     const parsedCategory = JSON.parse(category);
//     console.log("Parsed category ", parsedCategory);

//     if (
//       !name ||
//       !parsedCategory?.l1 ||
//       !pricing?.basePrice ||
//       stock === undefined
//     ) {
//       return res.status(400).json({
//         message:
//           "Missing required fields: name, category, pricing.basePrice, stock",
//       });
//     }

//     // Validate required fields
//     if (!name || !parsedCategory?.parent || !pricing || stock === undefined) {
//       return res.status(400).json({
//         message:
//           "Missing required fields: name, category.parent, basePrice, stock",
//       });
//     }

//     // Validate category structure
//     if (!mongoose.Types.ObjectId.isValid(parsedCategory.parent)) {
//       return res.status(400).json({ message: "Invalid parent category ID" });
//     }

//     // Process files
//     const requestedFiles = req.files || [];
//     const validImage = imageValidationHelper(requestedFiles);
//     if (!validImage.valid) {
//       return res.status(400).json({ message: validImage.message });
//     }

//     const variations = JSON.parse(req.body.variations);

//     // Process variations and upload images
//     const processedVariations = await processVariations(
//       variations,
//       requestedFiles
//     );

//     const productData = {
//       name,
//       slug: generateSlug(name),
//       description: description || "",
//       category: {
//         parent: parsedCategory.parent,
//         child: parsedCategory.child || null,
//         grandchild: parsedCategory.grandchild || null,
//       },
//       basePrice: parseFloat(pricing),
//       stock: parseInt(stock),
//       status,
//       tags: tags.slice(0, 10), // Enforce max 10 tags
//       additionalDetails,
//       discounts: discounts.map((d) => ({
//         type: d.type,
//         value: parseFloat(d.value),
//         expiry: d.expiry ? new Date(d.expiry) : null,
//       })),
//       isFeatured,
//       metaTitle: metaTitle || "",
//       metaDescription: metaDescription || "",
//     }; // Handle featured image

//     if (requestedFiles.featuredImage) {
//       const featuredImage = await uploadToCloudinary(
//         [requestedFiles.featuredImage],
//         "products/featured"
//       );
//       productData.featuredImage = featuredImage[0];
//     }

//     const product = new Product(productData);
//     await product.save({ session });

//     // Process and link variations
//     if (variations.length > 0) {
//       const { variationIds, defaultVariationId } =
//         await createProductVariations(
//           product._id,
//           processedVariations,
//           session
//         );

//       product.variations = variationIds;
//       product.defaultVariation = defaultVariationId;
//       await product.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     // Return created product with populated fields
//     const createdProduct = await Product.findById(product._id)
//       .populate("variations")
//       .populate("category.parent")
//       .populate("category.child")
//       .populate("category.grandchild");

//     res.status(201).json({
//       success: true,
//       message: "Product created successfully!",
//       createProduct: product,
//       product: createdProduct,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     handleError(res, error, "createProduct");
//   }
// };

// Enhanced getHomepageProducts

export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      description,
      category,
      pricing,
      stock,
      status = "draft",
      tags = [],
      additionalDetails = {},
      isFeatured = false,
      metaTitle,
      metaDescription,
      brand,
      variations: variationsInput = [],
    } = req.body;

    // 1. VALIDATION PHASE ============================================
    // Parse and validate category structure
    const parsedCategory = JSON.parse(category);
    if (!parsedCategory?.l1) {
      throw new Error("At least level 1 category (l1) is required");
    }

    // Validate all category levels exist and have correct hierarchy
    await validateCategoryHierarchy(parsedCategory, session);

    // Validate pricing structure
    if (!pricing?.basePrice) {
      throw new Error("Base price is required");
    }

    console.log(
      "Name: ",
      name,
      "Category: ",
      parsedCategory,
      "Pricing: ",
      pricing,
      "Stock: ",
      stock,
      "Status: ",
      status,
      "Tags: ",
      tags,
      "Additional Details: ",
      additionalDetails,
      "Is Featured: ",
      isFeatured,
      "Meta Title: ",
      metaTitle,
      "Meta Description: ",
      metaDescription,
      "Brand: ",
      brand
    );

    // Process and validate files
    const requestedFiles = req.files || [];
    const { valid, message } = imageValidationHelper(requestedFiles);
    if (!valid) throw new Error(message);

    // 2. DATA PREPARATION PHASE ======================================
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
      price: {
        base: Math.round(pricing.basePrice * 100), // Store in cents
        currency: pricing.currency || "USD",
        discount: pricing.discount || undefined,
      },
      stock: parseInt(stock, 10),
      status,
      tags: [...new Set(tags.slice(0, 10))], // Deduplicate and limit tags
      additionalDetails,
      isFeatured,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
    };

    // Process and upload images
    if (requestedFiles.images) {
      const uploadedImages = await uploadToCloudinary(
        Array.isArray(requestedFiles.images)
          ? requestedFiles.images
          : [requestedFiles.images],
        "products/images"
      );
      productData.images = uploadedImages.map((img, index) => ({
        url: img.url,
        alt: `${name} image ${index + 1}`,
        order: index,
      }));
    }

    // 3. DATABASE OPERATIONS PHASE ===================================
    // Create the product
    const product = new Product(productData);
    await product.save({ session });

    // Process variations if they exist
    if (variationsInput.length > 0) {
      const parsedVariations = JSON.parse(variationsInput);
      const { variationIds, defaultVariationId } =
        await createProductVariations(
          product._id,
          parsedVariations,
          product.price.currency, // Pass the product's currency to variations
          session
        );

      product.variations = variationIds;
      product.defaultVariation = defaultVariationId;
      await product.save({ session });
    }

    await session.commitTransaction();

    // 4. RESPONSE PREPARATION PHASE ==================================
    const createdProduct = await Product.findById(product._id)
      .populate({
        path: "variations",
        populate: { path: "colors.sizes" },
      })
      .populate("category.l1 category.l2 category.l3 category.l4");

    res.status(201).json({
      success: true,
      product: createdProduct,
    });
  } catch (error) {
    await session.abortTransaction();

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }

    // Handle custom error messages
    const userMessage = error.message.includes("Category validation")
      ? "Invalid category hierarchy"
      : error.message;

    res.status(400).json({
      success: false,
      message: userMessage,
    });
  } finally {
    session.endSession();
  }
};

// Helper function to validate category hierarchy
const validateCategoryHierarchy = async (category, session) => {
  const validateLevel = async (id, level, parentId = null) => {
    if (!id) return;

    const cat = await Category.findById(id).session(session);
    if (!cat) throw new Error(`Category ${id} not found for level ${level}`);

    if (
      level > 1 &&
      (!parentId || cat.parentCategory.toString() !== parentId)
    ) {
      throw new Error(
        `Category level ${level} must be child of level ${level - 1}`
      );
    }

    return cat._id.toString();
  };

  const l1Id = await validateLevel(category.l1, 1);
  const l2Id = await validateLevel(category.l2, 2, l1Id);
  const l3Id = await validateLevel(category.l3, 3, l2Id);
  await validateLevel(category.l4, 4, l3Id);
};

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
