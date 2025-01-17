import mongoose from "mongoose";
import Category from "../../models/category.model.js";
import { defaultCategories } from "./categoriesList.js";

const createCategoryObject = (category, parentCategoryId) => {
  return {
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    parentCategory: parentCategoryId, // Link to the parent category or null if it's a root
    status: category.status,
    sortOrder: category.sortOrder,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    subCategories: [], // Initialize with an empty subCategories array for nesting
  };
};

// const createSubCategoryObject = (category, parentCategoryId) => {
//   return {
//     _id: new mongoose.Types.ObjectId(),
//     name: category.name,
//     slug: category.slug,
//     image: category.image,
//     description: category.description,
//     parentCategory: parentCategoryId, // Link to the parent category or null if it's a root
//     status: category.status,
//     sortOrder: category.sortOrder,
//     metaTitle: category.metaTitle,
//     metaDescription: category.metaDescription,
//     subCategories: [], // Initialize with an empty subCategories array for nesting
//   };
// };
async function createCategoryWithSubcategories(category, parentId = null) {
  let existingCategory = await Category.findOne({ slug: category.slug });

  if (!existingCategory) {
    existingCategory = await Category.create(
      createCategoryObject(category, parentId)
    );
  }

  if (category.subCategories && category.subCategories.length > 0) {
    await addSubcategories(existingCategory, category.subCategories);
  }
}

async function addSubcategories(parentCategory, subCategories) {
  if (subCategories && subCategories.length > 0) {
    const subCategoryObjects = [];

    for (const subCategory of subCategories) {
      const subCategoryObject = {
        _id: new mongoose.Types.ObjectId(),
        ...createCategoryObject(subCategory, parentCategory._id),
      };

      if (subCategory.subCategories && subCategory.subCategories.length > 0) {
        subCategoryObject.subCategories = await addSubcategories(
          subCategoryObject,
          subCategory.subCategories
        );
      }

      subCategoryObjects.push(subCategoryObject);
    }

    await Category.updateOne(
      { _id: parentCategory._id },
      {
        $push: { subCategories: { $each: subCategoryObjects } },
      }
    );

    return subCategoryObjects;
  } else {
    console.log(`No subcategories to add for ${parentCategory.name}`);
    return [];
  }
}

async function initializeCategories() {
  for (const category of defaultCategories) {
    await createCategoryWithSubcategories(category);
  }
}

export default initializeCategories;
