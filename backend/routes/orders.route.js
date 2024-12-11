import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getOrderById,
  getOrders,
  orderStatusUpdate,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getOrders);
router.get("/send-order-status-email");
router.get("/:orderId", getOrderById);

// router.put("/:orderId/status", protectRoute, adminRoute, orderStatusUpdate);

export default router;
