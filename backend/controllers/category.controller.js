import { isValidObjectId } from "mongoose";
import Category from "../models/category.model.js";
import { imageValidationHelper } from "../helpers/validationHelper/imageValidationHelper.js";
import {
  validateCategoryData,
  validateCategoryType,
} from "../helpers/validationHelper/categoryValidationHelper.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs/promises";
import { insertCategoryWithSubcategories } from "../helpers/defaultCategoriesHelper/defaultCategoriesHelper.js";
import { defaultCategories } from "../helpers/defaultCategoriesHelper/categoriesList.js";
import Settings from "../models/settings.model.js";

export const createCategory = async (req, res) => {
  const {
    name,
    slug,
    description,
    parentCategory,
    categoryType,
    status,
    sortOrder,
    metaTitle,
    metaDescription,
  } = req.body;

  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });
  console.log("Existing category ", existingCategory);
  if (existingCategory) {
    return res
      .status(400)
      .json({ message: "Category with this slug already exists." });
  }

  const requestedFiles = Array.isArray(req.files) ? req.files : [req.file];
  console.log("Received image ", requestedFiles);

  const validImage = imageValidationHelper(requestedFiles);
  console.log("Image validation ", validImage);

  if (!validImage.valid) {
    return res.status(400).json({ message: validImage.message });
  }

  try {
    const uploadedImages = await Promise.all(
      requestedFiles?.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "category",
          });
          // Clean up temporary file
          if (result) await fs.unlink(file.path);

          console.log("Uploaded image ", result);
          return result.secure_url; // Return the URL of the uploaded image
        } catch (error) {
          console.error(`Error uploading ${file.filename}:`, error);
          // Return an error res message if the image upload fails with status code
          return res.status(500).json({
            message: "Internal Server Error while uploading images",
            error,
          });
        }
      })
    );

    console.log("Uploaded images ", uploadedImages);
    const categoryData = {
      name,
      // slug is used to create a unique URL for the category
      slug,
      description,
      image: uploadedImages[0],
      parentCategory: parentCategory || null,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
      categoryType,
      createdBy: req.user._id,
    };
    console.log("Category data ", categoryData);
    // add validation for the new category
    // const isValidCategoryData = validateCategoryData(categoryData);
    // if (!isValidCategoryData.valid) {
    //   return res.status(400).json({ message: isValidCategoryData.message });
    // }

    // const isValidCategoyType = validateCategoryType(categoryData);
    // if (!isValidCategoyType.valid) {
    //   return res.status(400).json({ message: isValidCategoyType.message });
    // }

    const category = await Category.create(categoryData);
    category.save();

    res.status(201).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

// Controller to fetch all parent categories
export const getParentCategories = async (req, res) => {
  try {
    const parentCategories = await Category.find({ parentCategory: null });
    res.status(200).json(parentCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({});

    const buildCategoryTree = (categories, parentId = null) => {
      return categories
        .filter(
          (category) =>
            category.parentCategory?.toString() === parentId?.toString()
        )
        .map((category) => ({
          ...category.toObject(), // Convert Mongoose document to a plain object
          subCategories: buildCategoryTree(categories, category._id), // Recursively find subcategories
        }));
    };

    // Build the tree starting with top-level categories (parentCategory = null)
    const categories = buildCategoryTree(allCategories, null);

    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting categories", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const {
    name,
    slug,
    description,
    image,
    parentCategory,
    status,
    sortOrder,
    metaTitle,
    metaDescription,
  } = req.body;
  const { id } = req.params;

  const categoryData = {
    name,
    // slug is used to create a unique URL for the category
    slug,
    description,
    image,
    parentCategory,
    status,
    sortOrder,
    metaTitle,
    metaDescription,
  };

  try {
    // add validation for the new category
    for (let key in categoryData) {
      if (
        !categoryData[key] ||
        categoryData[key] === "" ||
        categoryData[key] === null ||
        categoryData[key] === undefined
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
    }

    // here we are updating the category by id and passing the new data
    const category = await Category.findByIdAndUpdate(id, categoryData, {
      new: true,
    });
    console.log("Category updated ", category);

    res.status(200).json({ category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // here we are deleting the category by id
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

export const deleteCategoryTable = async (req, res) => {
  console.log(req, res); // Log the req and res to verify they are defined

  try {
    const response = await Category.collection.drop();
    console.log("Category Table is deleted", response);

    res.status(200).json({ message: "All categories deleted" });
  } catch (error) {
    console.log("Error deleting categories", error.message);

    if (res) {
      res
        .status(500)
        .json({ message: "Error deleting categories", error: error.message });
    } else {
      console.error("Response object is undefined");
    }
  }
};
// deleteCategoryTable();

// Function to initialize and insert the default categories
export const setDefaultCategories = async () => {
  try {
    // Check the settings to see if default categories are already set
    let settings = await Settings.findOne();
    // uncomment once to reset settings
    settings = new Settings({ isDefaultCategoriesSet: false });

    if (settings?.isDefaultCategoriesSet) {
      console.log("Default categories are already set.");
      return;
    }

    // Fetch all existing categories from the database
    const existingCategories = await Category.find({});

    for (const defaultCategory of defaultCategories) {
      // Check if the category already exists by name
      const existingCategory = existingCategories.find(
        (category) => category.name === defaultCategory.name
      );

      if (existingCategory) {
        // Update the category if its fields differ from the default category
        const isDifferent = Object.keys(defaultCategory).some(
          (key) =>
            JSON.stringify(existingCategory[key]) !==
            JSON.stringify(defaultCategory[key])
        );

        if (isDifferent) {
          await Category.updateOne(
            { _id: existingCategory._id }, // Use the category ID to update
            { $set: defaultCategory }
          );
          console.log(`Updated category: ${defaultCategory.name}`);
        }
      } else {
        // Insert the new category if it doesn't exist
        await insertCategoryWithSubcategories(defaultCategory);
        console.log(`Inserted new category: ${defaultCategory.name}`);
      }
    }

    // Set the flag in the settings collection to indicate default categories are initialized
    if (!settings) {
      settings = new Settings({ isDefaultCategoriesSet: true });
    } else {
      settings.isDefaultCategoriesSet = true;
    }
    await settings.save();

    console.log("Default categories set successfully.");
  } catch (error) {
    // Improved error handling
    console.error("Error setting default categories:", error.message);
    throw new Error(error.message);
  }
};
