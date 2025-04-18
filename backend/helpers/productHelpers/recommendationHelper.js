import mongoose from "mongoose";
import redis from "../../db/redis.js";
import Product from "../../models/product.model.js";
import { handleError } from "../../utils/handleError/handleError.js";

export const __getRecommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const RECOMMENDATION_LIMIT = 10; // Constant for max number of recommendations

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // 1. Get current product's category
    const currentProduct = await Product.findById(productId)
      .select("category")
      .lean();

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Determine recommendation strategy
    let recommendedProducts = [];
    let recommendationSource = "none";

    // Try category-based recommendations first
    if (currentProduct?.category) {
      const categoryId = getMostSpecificCategoryId(currentProduct.category);

      if (categoryId) {
        const cacheKey = `recs:cat:${categoryId}`;

        // Check cache
        const cachedRecs = await getValidCache(cacheKey);
        if (cachedRecs) {
          return res.status(200).json({
            success: true,
            products: cachedRecs.slice(0, RECOMMENDATION_LIMIT),
            source: "cache",
          });
        }

        // Get from database
        recommendedProducts = await getCategoryBasedRecommendations(
          productId,
          currentProduct.category,
          categoryId,
          RECOMMENDATION_LIMIT
        );
        recommendationSource = "category";

        // Cache results
        if (recommendedProducts.length > 0) {
          await cacheProducts(cacheKey, recommendedProducts);
        }
      }
    }

    // Fallback to random products if needed
    if (recommendedProducts.length < RECOMMENDATION_LIMIT) {
      const needed = RECOMMENDATION_LIMIT - recommendedProducts.length;
      const randomProducts = await getRandomProducts(productId, needed);
      recommendedProducts = [...recommendedProducts, ...randomProducts];
      recommendationSource =
        recommendationSource === "none"
          ? "random"
          : `${recommendationSource}+random`;
    }

    // Ensure we don't exceed the limit
    recommendedProducts = recommendedProducts.slice(0, RECOMMENDATION_LIMIT);

    res.status(200).json({
      success: true,
      products: recommendedProducts,
      source: recommendationSource,
      count: recommendedProducts.length,
    });
  } catch (error) {
    handleError(res, error, "Server error in getRecommendedProducts", 500);
    console.error("Error in getRecommendedProducts:", error);
  }
};

// Helper function to get the most specific category ID
function getMostSpecificCategoryId(category) {
  return category.l4 || category.l3 || category.l2 || category.l1 || null;
}

// Get category-based recommendations
async function getCategoryBasedRecommendations(
  excludeProductId,
  category,
  categoryId,
  limit
) {
  try {
    const query = {
      status: "active",
      _id: { $ne: new mongoose.Types.ObjectId(excludeProductId) },
    };

    // Determine which category level to use
    const categoryField = category.l4
      ? "category.l4"
      : category.l3
      ? "category.l3"
      : category.l2
      ? "category.l2"
      : "category.l1";
    query[categoryField] = categoryId;

    return await Product.find(query)
      .limit(limit)
      .populate("category.l1 category.l2 category.l3 category.l4", "name slug")
      .populate({
        path: "variations",
        model: "ProductVariation",
        populate: {
          path: "colors.sizes",
          model: "ProductVariationSize",
        },
      })
      .select("name slug basePrice variations stockStatus images")
      .sort({ popularity: -1, createdAt: -1 }) // Sort by popularity then recency
      .lean();
  } catch (error) {
    console.error("Error in getCategoryBasedRecommendations:", error);
    return [];
  }
}

// Get random products with efficient sampling
async function getRandomProducts(excludeProductId, limit = 10) {
  try {
    // More efficient random sampling for large collections
    const count = await Product.countDocuments({
      status: "active",
      _id: { $ne: new mongoose.Types.ObjectId(excludeProductId) },
    });

    if (count === 0) return [];

    const randomSkip = Math.max(0, Math.floor(Math.random() * count) - limit);

    return await Product.find({
      status: "active",
      _id: { $ne: new mongoose.Types.ObjectId(excludeProductId) },
    })
      .skip(randomSkip)
      .limit(limit)
      .populate("category.l1 category.l2 category.l3 category.l4", "name slug")
      .select("name slug basePrice variations stockStatus images")
      .lean();
  } catch (error) {
    console.error("Error in getRandomProducts:", error);
    return [];
  }
}

// Cache functions remain the same as previous implementation
async function getValidCache(cacheKey) {
  try {
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error("Cache error:", e);
    return null;
  }
}

async function cacheProducts(key, products, ttl = 3600) {
  try {
    await redis.set(key, JSON.stringify(products), "EX", ttl);
  } catch (e) {
    console.error("Caching failed:", e);
  }
}
