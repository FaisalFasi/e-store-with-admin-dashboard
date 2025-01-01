import { isValidObjectId } from "mongoose";
import Category from "../models/category.model.js";

export const createCategory = async (req, res) => {
  const {
    name,
    slug,
    description,
    image,
    parentCategory,
    categoryType,
    status,
    sortOrder,
    metaTitle,
    metaDescription,
  } = req.body;
  try {
    const categoryData = {
      name,
      // slug is used to create a unique URL for the category
      slug,
      description,
      image,
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
    if (categoryType === "child" && !parentCategory) {
      if (!isValidObjectId(parentCategory)) {
        console.log("Parent category in validation ", parentCategory);
        return res.status(400).json({ message: "Parent category is required" });
      }
    } else if (categoryType === "parent" && parentCategory) {
      return res
        .status(400)
        .json({ message: "Parent category should not have parent category" });
    }

    const newCategory = Category.create(categoryData);
    const category = await newCategory.save();

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
    console.log("Parent categories ", parentCategories);
    res.status(200).json(parentCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    console.log("Categoris get endpoint ", categories);
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