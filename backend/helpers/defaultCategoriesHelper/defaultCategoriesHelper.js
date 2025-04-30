import Category from "../../models/category.model.js";
import Settings from "../../models/settings.model.js";
import { defaultCategories } from "./categoriesList.js";

/**
 * Builds a flat list of categories from a hierarchical structure
 * with proper depth tracking
 */
const buildFlatCategoryList = (categories, parentId = null, depth = 0) => {
  let flatList = [];

  categories.forEach((category, index) => {
    // Skip if we've reached maximum depth (L4 = depth 3)
    if (depth > 3) return;

    // Create a new category object with depth information
    const categoryNode = {
      name: category.name,
      slug: category.slug,
      parentCategory: parentId,
      depth: depth,
      status: category.status || "active",
      sortOrder: category.sortOrder !== undefined ? category.sortOrder : index,
      metaTitle: category.metaTitle || category.name,
      metaDescription: category.metaDescription || "",
      image: category.image || null,
      description: category.description || "",
    };

    flatList.push(categoryNode);

    // Process subcategories if they exist
    if (category.subCategories?.length > 0) {
      flatList = flatList.concat(
        buildFlatCategoryList(category.subCategories, category.slug, depth + 1)
      );
    }
  });

  return flatList;
};

/**
 * Sets up default categories in the database
 */
export const __setDefaultCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategoriesCount = await Category.countDocuments();

    // Check settings to see if default categories have been set
    const settings = await Settings.findOne();

    if (settings?.isDefaultCategoriesSet && existingCategoriesCount > 0) {
      console.log("Categories already initialized");
      return;
    }

    // If there are existing categories but settings flag is not set,
    // we'll update the flag but not recreate categories
    if (existingCategoriesCount > 0) {
      await Settings.updateOne(
        {},
        { $set: { isDefaultCategoriesSet: true } },
        { upsert: true }
      );
      console.log("Categories exist but flag was not set. Updated flag.");
      return;
    }

    console.log("Initializing default categories...");

    // Build a flat list of all categories with proper depth and parent references
    const allCategoriesFlat = buildFlatCategoryList(defaultCategories);

    console.log(`Processed ${allCategoriesFlat.length} categories`);

    // Create a slug-to-ID mapping object for parent references
    const slugToIdMap = {};

    // First pass: insert all categories without parent references
    const bulkOps = allCategoriesFlat.map((cat) => ({
      updateOne: {
        filter: { slug: cat.slug },
        update: {
          $setOnInsert: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            image: cat.image || null,
            depth: cat.depth,
            sortOrder: cat.sortOrder,
            status: cat.status,
            metaTitle: cat.metaTitle || cat.name,
            metaDescription: cat.metaDescription || "",
          },
        },
        upsert: true,
      },
    }));

    // Execute bulk operation
    const bulkResult = await Category.bulkWrite(bulkOps);
    console.log(`Inserted ${bulkResult.upsertedCount} categories`);

    // Second pass: get all IDs and build the slug-to-ID map
    const allCategoriesInDB = await Category.find({});
    allCategoriesInDB.forEach((cat) => {
      slugToIdMap[cat.slug] = cat._id;
    });

    // Third pass: update parent references
    const parentUpdateOps = allCategoriesFlat
      .filter((cat) => cat.parentCategory)
      .map((cat) => ({
        updateOne: {
          filter: { slug: cat.slug },
          update: {
            $set: {
              parentCategory: slugToIdMap[cat.parentCategory] || null,
            },
          },
        },
      }));

    if (parentUpdateOps.length > 0) {
      const parentResult = await Category.bulkWrite(parentUpdateOps);
      console.log(`Updated ${parentResult.modifiedCount} parent references`);
    }

    // Mark as complete
    await Settings.updateOne(
      {},
      { $set: { isDefaultCategoriesSet: true } },
      { upsert: true }
    );

    console.log(
      `Successfully initialized ${allCategoriesFlat.length} categories`
    );
    return { success: true, count: allCategoriesFlat.length };
  } catch (error) {
    console.error("Category initialization failed:", error);
    throw error;
  }
};
