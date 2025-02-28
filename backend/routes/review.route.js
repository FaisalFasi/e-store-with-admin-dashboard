import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  markHelpful,
} from "../controllers/review.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createReview);
router.get("/product/:productId", getProductReviews);
router
  .route("/:id")
  .put(protectRoute, updateReview)
  .delete(protectRoute, deleteReview);

router.post("/:id/helpful", protectRoute, markHelpful);

export default router;
