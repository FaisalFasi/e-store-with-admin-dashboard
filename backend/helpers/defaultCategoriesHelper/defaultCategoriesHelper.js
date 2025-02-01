import Category from "../../models/category.model.js";

// Recursive function to insert categories and subcategories
export const insertCategoryWithSubcategories = async (category) => {
  try {
    const existingCategory = await Category.findOne({
      $or: [{ slug: category.slug }, { name: category.name }],
    });

    if (existingCategory) {
      console.log(
        `Category "${category.name}" already exists, skipping insertion.`
      );
      return;
    }

    // Create the category document
    const newCategory = new Category({
      name: category.name,
      slug: category.slug,
      parentCategory: category.parentCategory
        ? category.parentCategory._id
        : null,
      status: category.status,
      sortOrder: category.sortOrder,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      image: category.image,
    });

    // Save the parent category
    const savedCategory = await newCategory.save();

    // Recursively insert subcategories if any
    if (category.subCategories && category.subCategories.length > 0) {
      const subCategoryPromises = category.subCategories.map((subCategory) => {
        subCategory.parentCategory = savedCategory; // Set parent category for subcategory
        return insertCategoryWithSubcategories(subCategory, savedCategory); // Recursively insert subcategories
      });
      await Promise.all(subCategoryPromises); // Insert subcategories in parallel
    }

    console.log(
      `Category "${savedCategory.name}" and its subcategories (if any) inserted successfully!`
    );
  } catch (error) {
    console.error("Error inserting category:", error);
  }
};
