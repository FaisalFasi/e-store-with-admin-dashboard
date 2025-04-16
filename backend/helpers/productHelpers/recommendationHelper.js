import mongoose from "mongoose";
import redis from "../../db/redis.js";
import Product from "../../models/product.model.js";
import { handleError } from "../../utils/handleError/handleError.js";
import { populate } from "dotenv";

export const __getRecommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Get current product's deepest category
    const currentProduct = await Product.findById(productId)
      .select("category")
      .lean();

    if (!currentProduct?.category) {
      return res.status(200).json({
        success: true,
        products: [],
        message: "Product has no category assigned",
      });
    }

    // 2. Determine the most specific category level to use
    const categoryLevels = [
      currentProduct.category.l4,
      currentProduct.category.l3,
      currentProduct.category.l2,
      currentProduct.category.l1,
    ];
    const categoryId = categoryLevels.find((id) => id) || null;
    const cacheKey = `recs:cat:${categoryId}`;

    console.log("categoryId---", categoryId);

    // 3. Check Redis cache with proper validation
    const cachedData = await getValidCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        products: cachedData,
        source: "cache",
      });
    }

    // 4. Query database with optimized query
    const recommendedProducts = await getProductsFromDatabase(
      productId,
      currentProduct.category,
      categoryId
    );

    // 5. Cache the results if we have products
    if (recommendedProducts?.length > 0) {
      await cacheProducts(cacheKey, recommendedProducts);
    }

    // 6. Return the results
    res.status(200).json({
      success: true,
      products: recommendedProducts,
      source: "database",
    });
  } catch (error) {
    handleError(res, error, "Server error  in getRecommendedProducts", 500);
    console.error("Error in getRecommendedProducts:", error);
  }
};

// Helper Functions

// 1. Cache Management
async function getValidCache(cacheKey) {
  try {
    const cached = await redis.get(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    handleError(res, e, "Caching error", 500);

    console.error("Cache error:", e);
    return null;
  }
}

async function cacheProducts(key, products, ttl = 3600) {
  try {
    await redis.set(key, JSON.stringify(products), "EX", ttl);
  } catch (e) {
    handleError(res, e, "Caching failed", 500);
    console.error("Caching failed:", e);
  }
}

// 2. Database Query
async function getProductsFromDatabase(currentProductId, category, categoryId) {
  const query = {
    status: "draft",
    _id: { $ne: new mongoose.Types.ObjectId(currentProductId) },
  };

  const categoryConditions = [];

  if (category.l4) {
    categoryConditions.push({ "category.l4": category.l4 });
  }
  if (category.l3) {
    categoryConditions.push({ "category.l3": category.l3 });
  }
  if (category.l2) {
    categoryConditions.push({ "category.l2": category.l2 });
  }
  if (category.l1) {
    categoryConditions.push({ "category.l1": category.l1 });
  }

  if (categoryConditions.length > 0) {
    query.$or = categoryConditions;
  } else {
    // No  category  conditions  -  fall  back  to  random  products
    return await getRandomProducts(currentProductId);
  }

  const products = await Product.find(query)
    .limit(10)
    .populate("category.l1 category.l2 category.l3 category.l4", "name slug")
    .populate({
      path: "variations",
      model: "ProductVariation", // Double-check model name
      populate: {
        path: "colors.sizes",
        model: "ProductVariation",
      },
    })
    // .select("name slug basePrice variations stockStatus")
    .sort({ createdAt: -1 }) // Get newest products first
    .lean();

  return products;
  // return products.map(formatProductData);
}

async function getRandomProducts(excludeProductId) {
  return await Product.find({
    status: "draft",
    _id: { $ne: new mongoose.Types.ObjectId(excludeProductId) },
  })
    // .limit(10)
    // .select("name  slug  variations ")
    // .sort({ createdAt: -1 })
    .populate("category.l1 category.l2 category.l3 category.l4", "name slug")
    .populate({
      path: "variations",
      model: "ProductVariation", // Double-check model name
      populate: {
        path: "colors.sizes",
        model: "ProductVariation",
      },
    })
    .lean();
  // .then((products) => products.map(formatProductData));
}
// 3. Data Formatting
function formatProductData(product) {
  return product;
  // return {
  //   _id: product._id,
  //   name: product.name,
  //   slug: product.slug,
  //   price: product.basePrice,
  //   inStock: product.stockStatus === "in_stock", // Added stock status
  //   imageUrl: getProductImage(product),
  // };
}

function getProductImage(product) {
  console.log("product:", product);
  return (
    product?.variations?.[0]?.colors?.[0]?.imageUrls?.[0] ||
    "/public/images/placeholder.jpg"
  );
}

// 4. Cache Invalidation (Call this when products change)
export async function invalidateRecommendationsCache(productId) {
  try {
    const product = await Product.findById(productId).select("category").lean();
    if (!product?.category) return;

    const categoryLevels = [
      product.category.l4,
      product.category.l3,
      product.category.l2,
      product.category.l1,
    ];

    await Promise.all(
      categoryLevels
        .filter(Boolean)
        .map((catId) => redis.del(`recs:cat:${catId}`))
    );
  } catch (e) {
    handleError(res, e, "Cache invalidation error", 500);
    console.error("Cache invalidation error:", e);
  }
}
