import { isValidObjectId } from "mongoose";
import Category from "../models/category.model.js";
import { imageValidationHelper } from "../helpers/validationHelper/imageValidationHelper.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs/promises";
import { __setDefaultCategories } from "../helpers/defaultCategoriesHelper/defaultCategoriesHelper.js";
import { handleError } from "../utils/handleError/handleError.js";
import Settings from "../models/settings.model.js";

/**
 * Create a new category
 */
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      depth,
      parentCategory,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(400).json({
        message: `Category with this ${
          existingCategory.name === name ? "name" : "slug"
        } already exists.`,
      });
    }

    // Validate depth
    const depthNum = Number(depth);
    if (isNaN(depthNum) || depthNum < 0 || depthNum > 3) {
      return res.status(400).json({
        message: "Depth must be between 0 and 3 (L1 to L4)",
      });
    }

    // For non-L1 categories, validate parent category
    if (depthNum > 0) {
      if (!parentCategory) {
        return res.status(400).json({
          message: "Parent category is required for non-L1 categories",
        });
      }

      // Verify parent exists and has correct depth
      if (!isValidObjectId(parentCategory)) {
        return res.status(400).json({ message: "Invalid parent category ID" });
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: "Parent category not found" });
      }

      if (parent.depth !== depthNum - 1) {
        return res.status(400).json({
          message: `Parent category must be a ${
            depthNum - 1 === 0 ? "L1" : depthNum - 1 === 1 ? "L2" : "L3"
          } category`,
        });
      }
    } else {
      // L1 categories should not have a parent
      if (parentCategory) {
        return res.status(400).json({
          message: "L1 categories cannot have a parent category",
        });
      }
    }

    // Process image upload if present
    let imageUrl = null;
    if (req.file) {
      const validImage = imageValidationHelper([req.file]);

      if (!validImage.valid) {
        return res.status(400).json({ message: validImage.message });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "category",
      });

      // Clean up temporary file
      await fs.unlink(req.file.path);

      imageUrl = result.secure_url;
    }

    // Create the category
    const categoryData = {
      name,
      slug,
      description: description || "",
      image: imageUrl,
      depth: depthNum,
      parentCategory: depthNum > 0 ? parentCategory : null,
      status: status || "active",
      sortOrder: sortOrder || 0,
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || description || "",
      createdBy: req.user?._id,
    };

    const category = await Category.create(categoryData);

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

/**
 * Get all categories with optional filtering
 */
export const getAllCategories = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { depth, parentId, status } = req.query;

    // Build query object
    const query = {};

    if (depth !== undefined) {
      query.depth = Number(depth);
    }

    if (parentId) {
      if (parentId === "null") {
        query.parentCategory = null;
      } else {
        query.parentCategory = parentId;
      }
    }

    if (status) {
      query.status = status;
    }

    // Fetch categories with sorting
    const categories = await Category.find(query)
      .sort({ depth: 1, sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      message: "Error getting categories",
      error: error.message,
    });
  }
};

/**
 * Get categories by depth level (L1, L2, L3, L4)
 */
export const getCategoriesByDepth = async (req, res) => {
  try {
    const { depth } = req.params;
    const depthNum = Number(depth);

    if (isNaN(depthNum) || depthNum < 0 || depthNum > 3) {
      return res.status(400).json({
        message: "Depth must be between 0 and 3 (L1 to L4)",
      });
    }

    const categories = await Category.find({ depth: depthNum })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories by depth:", error);
    res.status(500).json({
      message: "Error getting categories by depth",
      error: error.message,
    });
  }
};

/**
 * Get child categories for a specific parent
 */
export const getChildCategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!isValidObjectId(parentId) && parentId !== "null") {
      return res.status(400).json({ message: "Invalid parent ID" });
    }

    const query =
      parentId === "null"
        ? { parentCategory: null }
        : { parentCategory: parentId };

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting child categories:", error);
    res.status(500).json({
      message: "Error getting child categories",
      error: error.message,
    });
  }
};

/**
 * Get parent categories (L1 categories)
 */
export const getParentCategories = async (req, res) => {
  try {
    const parentCategories = await Category.find({
      depth: 0,
      status: req.query.status || "active",
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json(parentCategories);
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    res.status(500).json({
      message: "Error fetching parent categories",
      error: error.message,
    });
  }
};

/**
 * Get category tree (hierarchical structure)
 */
export const getCategoryTree = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status } = req.query;

    // Build query object
    const query = {};

    if (status) {
      query.status = status;
    }

    // Fetch all categories
    const categories = await Category.find(query)
      .sort({ depth: 1, sortOrder: 1, name: 1 })
      .lean();

    // Build the tree structure
    const buildCategoryTree = (categories, parentId = null) => {
      return categories
        .filter((category) => {
          const catParentId = category.parentCategory
            ? category.parentCategory.toString()
            : null;
          return catParentId === parentId;
        })
        .map((category) => ({
          ...category,
          subCategories: buildCategoryTree(categories, category._id.toString()),
        }));
    };

    const categoryTree = buildCategoryTree(categories);

    return res.status(200).json(categoryTree);
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return res.status(500).json({
      error: "Failed to fetch category tree",
      message: error.message,
    });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const {
      name,
      slug,
      description,
      depth,
      parentCategory,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    // Find the category to update
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if another category with the same slug exists (excluding this one)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (slugExists) {
        return res.status(400).json({
          message: "Another category with this slug already exists",
        });
      }
    }

    // Validate depth and parent relationship if changing depth
    const depthNum =
      depth !== undefined ? Number(depth) : existingCategory.depth;

    if (isNaN(depthNum) || depthNum < 0 || depthNum > 3) {
      return res.status(400).json({
        message: "Depth must be between 0 and 3 (L1 to L4)",
      });
    }

    // For non-L1 categories, validate parent category
    let parentId = parentCategory || existingCategory.parentCategory;

    if (depthNum > 0) {
      if (!parentId) {
        return res.status(400).json({
          message: "Parent category is required for non-L1 categories",
        });
      }

      // Prevent circular references
      if (parentId.toString() === id) {
        return res.status(400).json({
          message: "A category cannot be its own parent",
        });
      }

      // Check if any of this category's descendants is the new parent
      const isDescendant = async (categoryId, potentialDescendantId) => {
        if (categoryId.toString() === potentialDescendantId.toString()) {
          return true;
        }

        const children = await Category.find({ parentCategory: categoryId });

        for (const child of children) {
          if (await isDescendant(child._id, potentialDescendantId)) {
            return true;
          }
        }

        return false;
      };

      if (await isDescendant(id, parentId)) {
        return res.status(400).json({
          message: "Cannot set a descendant as the parent category",
        });
      }

      // Verify parent exists and has correct depth
      const parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(400).json({ message: "Parent category not found" });
      }

      if (parent.depth !== depthNum - 1) {
        return res.status(400).json({
          message: `Parent category must be a ${
            depthNum - 1 === 0 ? "L1" : depthNum - 1 === 1 ? "L2" : "L3"
          } category`,
        });
      }
    } else {
      // L1 categories should not have a parent
      parentId = null;
    }

    // Process image upload if present
    let imageUrl = existingCategory.image;
    if (req.file) {
      const validImage = imageValidationHelper([req.file]);

      if (!validImage.valid) {
        return res.status(400).json({ message: validImage.message });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "category",
      });

      // Clean up temporary file
      await fs.unlink(req.file.path);

      imageUrl = result.secure_url;
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        description:
          description !== undefined
            ? description
            : existingCategory.description,
        image: imageUrl,
        depth: depthNum,
        parentCategory: parentId,
        status: status || existingCategory.status,
        sortOrder:
          sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
        metaTitle:
          metaTitle !== undefined ? metaTitle : existingCategory.metaTitle,
        metaDescription:
          metaDescription !== undefined
            ? metaDescription
            : existingCategory.metaDescription,
      },
      { new: true }
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has children
    const hasChildren = await Category.exists({ parentCategory: id });
    if (hasChildren) {
      return res.status(400).json({
        message:
          "Cannot delete a category that has child categories. Delete the children first.",
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    // Delete image from Cloudinary if it exists
    if (category.image) {
      try {
        const publicId = category.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`category/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with the response even if image deletion fails
      }
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};

/**
 * Delete all categories (drop collection)
 */
export const deleteCategoryTable = async (req, res) => {
  try {
    await Category.collection.drop();

    // Reset the settings flag
    await Settings.updateOne(
      {},
      { $set: { isDefaultCategoriesSet: false } },
      { upsert: true }
    );

    res.status(200).json({ message: "All categories deleted successfully" });
  } catch (error) {
    console.error("Error deleting categories:", error);
    res.status(500).json({
      message: "Error deleting categories",
      error: error.message,
    });
  }
};

/**
 * Set default categories
 */
export const setDefaultCategories = async (req, res) => {
  try {
    await __setDefaultCategories();
    res?.status(200).json({ message: "Default categories set successfully" });
  } catch (error) {
    console.error("Error setting default categories:", error);
    handleError(res, error, "Categories creation error", 500);
  }
};

/**
 * Search categories
 */
export const searchCategories = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const categories = await Category.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { slug: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .limit(Number(limit))
      .sort({ depth: 1, name: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error searching categories:", error);
    res.status(500).json({
      message: "Error searching categories",
      error: error.message,
    });
  }
};
