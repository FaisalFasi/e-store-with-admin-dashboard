import mongoose from "mongoose";

const { isValidObjectId } = mongoose;

export const validateCategoryData = (categoryData) => {
  console.log("Category data ", categoryData);
  // Check if all fields in categoryData are provided
  for (const key in categoryData) {
    // Skip the validation for parentCategory if it's allowed to be null
    if (
      key === "parentCategory" &&
      categoryData.categoryType === "parent" &&
      categoryData[key] === null
    ) {
      continue; // Skip this field from validation
    }
    if (
      !categoryData[key] ||
      categoryData[key] === "" ||
      categoryData[key] === undefined
    ) {
      return { valid: false, message: `Field '${key}' is required.` };
    }
  }

  return { valid: true };
};

export const validateCategoryType = (categoryData) => {
  if (categoryData.categoryType === "child" && !categoryData.parentCategory) {
    if (!isValidObjectId(categoryData.parentCategory)) {
      return {
        valid: false,
        message: "Parent category is required and must be a valid ID.",
      };
    }
  } else if (
    categoryData.categoryType === "parent" &&
    categoryData.parentCategory
  ) {
    return {
      valid: false,
      message: "Parent category should not have a parent category.",
    };
  }

  return { valid: true };
};
