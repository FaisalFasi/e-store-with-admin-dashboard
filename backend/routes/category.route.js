import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getParentCategories,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllCategories);
router.get("/parent-categories", protectRoute, adminRoute, getParentCategories);
router.post("/create-category", protectRoute, adminRoute, createCategory);

router.put("/:id", protectRoute, adminRoute, updateCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);

export default router;
