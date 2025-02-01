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
} from "../controllers/category.controller.js";
import multer from "multer";

const router = express.Router();
// here multer is used to handle file uploads
const upload = multer({ dest: "uploads/" }); // Save files temporarily in 'uploads' folder

router.get("/", protectRoute, adminRoute, getAllCategories);
router.post("/set-default-categories", setDefaultCategories);
router.get("/parent-categories", protectRoute, adminRoute, getParentCategories);
// The upload.single("image") middleware is used to handle single file upload
router.post(
  "/create-category",
  protectRoute,
  adminRoute,
  upload.single("image"),
  createCategory
);

router.put("/:id", protectRoute, adminRoute, updateCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);
router.delete(
  "/delete-category-table",
  protectRoute,
  adminRoute,
  deleteCategoryTable
);

export default router;
