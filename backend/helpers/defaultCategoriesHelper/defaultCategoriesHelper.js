import Category from "../../models/category.model.js";
import Settings from "../../models/settings.model.js";
import { defaultCategories } from "./categoriesList.js";

const buildFlatCategoryList = (categories, parentId = null, depth = 0) => {
  let flatList = [];

  categories.forEach((category) => {
    const categoryNode = {
      ...category,
      parentCategory: parentId,
      depth: depth,
      // Remove subCategories as we'll handle relationships via parentCategory
    };

    flatList.push(categoryNode);

    if (category.subCategories?.length > 0) {
      flatList = flatList.concat(
        buildFlatCategoryList(category.subCategories, category.slug, depth + 1)
      );
    }
  });

  return flatList;
};

export const __setDefaultCategories = async () => {
  try {
    const settings = await Settings.findOne();
    await Settings.updateOne(
      {},
      { $set: { isDefaultCategoriesSet: false } },
      { upsert: true }
    );
    if (settings?.isDefaultCategoriesSet) {
      console.log("Categories already initialized");
      return;
    }

    // Build a flat list of all categories with parent references
    const allCategoriesFlat = buildFlatCategoryList(defaultCategories);

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
            icon: cat.icon,
            // other fields...
            depth: cat.depth,
          },
        },
        upsert: true,
      },
    }));

    // Execute bulk operation
    await Category.bulkWrite(bulkOps);

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
          filter: { _id: slugToIdMap[cat.slug] },
          update: {
            $set: { parentCategory: slugToIdMap[cat.parentCategory] },
          },
        },
      }));

    if (parentUpdateOps.length > 0) {
      await Category.bulkWrite(parentUpdateOps);
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
  } catch (error) {
    console.error("Initialization failed:", error);
  }
};

// import Category from "../../models/category.model.js";
// import Settings from "../../models/settings.model.js";
// import { defaultCategories } from "./categoriesList.js";

// const upsertCategoryTree = async (categoryData, parentId = null) => {
//   // 1. Check if category exists
//   let categoryDoc = await Category.findOne({ slug: categoryData.slug });

//   // 2. If doesn't exist, create it
//   if (!categoryDoc) {
//     categoryDoc = await Category.create({
//       ...categoryData,
//       parentCategory: parentId,
//       depth: parentId ? (await Category.findById(parentId)).depth + 1 : 0,
//     });
//     console.log(`Created category: ${categoryData.slug}`);
//   } else {
//     console.log(`Skipped existing category: ${categoryData.slug}`);
//   }

//   // 3. Process subcategories
//   if (categoryData.subCategories?.length > 0) {
//     await Promise.all(
//       categoryData.subCategories.map((subCategory) =>
//         upsertCategoryTree(subCategory, categoryDoc._id)
//       )
//     );
//   }

//   return categoryDoc;
// };

// // Initialize categories (optimized)
// export const __setDefaultCategories = async () => {
//   try {
//     await Settings.updateOne(
//       {},
//       { $set: { isDefaultCategoriesSet: false } },
//       { upsert: true }
//     );

//     const settings = await Settings.findOne();
//     if (settings.isDefaultCategoriesSet) {
//       console.log("Categories already initialized");
//       return;
//     }

//     // Clear existing categories (optional)
//     await Category.deleteMany({});

//     // Insert the complete tree
//     await Promise.all(
//       defaultCategories.map((category) => upsertCategoryTree(category))
//     );

//     // Mark as complete
//     await Settings.updateOne({}, { $set: { isDefaultCategoriesSet: true } });
//     console.log("All categories and subcategories initialized successfully");
//   } catch (error) {
//     console.error("Initialization failed:", error);
//   }
// };
