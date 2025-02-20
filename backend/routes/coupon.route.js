import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getCoupon,
  validateCoupon,
  getCouponsForUser,
} from "../controllers/coupen.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);
router.get("/user-coupons", protectRoute, getCouponsForUser);

export default router;
