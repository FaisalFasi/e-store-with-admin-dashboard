import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getParentCategories,
  deleteCategoryTable,
  setDefaultCategories,
  getCategoriesByDepth,
  getChildCategories,
  searchCategories,
  getCategoryTree,
} from "../controllers/category.controller.js";
import multer from "multer";

const router = express.Router();
// here multer is used to handle file uploads
const upload = multer({ dest: "uploads/" }); // Save files temporarily in 'uploads' folder

// Get all categories (with optional filtering)
router.get("/", protectRoute, adminRoute, getAllCategories);

// Get categories by depth level (L1, L2, L3, L4)
router.get("/depth/:depth", protectRoute, adminRoute, getCategoriesByDepth);

// Get child categories for a specific parent
router.get("/children/:parentId", protectRoute, adminRoute, getChildCategories);

// Get parent categories (L1 categories)
router.get("/parent-categories", protectRoute, adminRoute, getParentCategories);

// Get category tree (hierarchical structure)
router.get("/tree", protectRoute, adminRoute, getCategoryTree);

// Search categories
router.get("/search", protectRoute, adminRoute, searchCategories);

// Create a new category
router.post(
  "/create-category",
  protectRoute,
  adminRoute,
  upload.single("image"),
  createCategory
);

// Update a category
router.put(
  "/:id",
  protectRoute,
  adminRoute,
  upload.single("image"),
  updateCategory
);

// Delete a category
router.delete("/:id", protectRoute, adminRoute, deleteCategory);

// Delete all categories (drop collection)
router.delete(
  "/delete-category-table",
  protectRoute,
  adminRoute,
  deleteCategoryTable
);

// Set default categories
router.post("/set-default-categories", setDefaultCategories);

export default router;
