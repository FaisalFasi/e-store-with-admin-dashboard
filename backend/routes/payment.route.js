import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createCheckoutSession,
  checkoutSuccess,
} from "../controllers/payment.controller.js";
import limiter from "../middleware/limiter.js";

const router = express.Router();

router.post(
  "/create-checkout-session",
  protectRoute,
  limiter,
  createCheckoutSession
);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
