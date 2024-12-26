import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllCategories);
router.post("/create-category", protectRoute, adminRoute, createCategory);
router.put("/category/:id", protectRoute, adminRoute, updateCategory);
router.delete("/category/:id", protectRoute, adminRoute, deleteCategory);

export default router;
