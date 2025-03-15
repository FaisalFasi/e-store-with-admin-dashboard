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
  getHomepageProducts,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", getAllProducts);
router.post("/", protectRoute, adminRoute, upload.any(), createProduct);
router.get("/getHomeProducts", getHomepageProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductByCategory);
router.get("/:id", getProductById);
router.patch(
  "/toggleFeature/:id",
  protectRoute,
  adminRoute,
  toggleFeaturedProduct
);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
