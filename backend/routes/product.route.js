import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  getProductByCategory,
  toggleFeaturedProduct,
  createProduct,
  deleteProduct,
  getProductById,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", protectRoute, adminRoute, upload.any(), createProduct);
router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductByCategory);
router.get("/:id", getProductById);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
