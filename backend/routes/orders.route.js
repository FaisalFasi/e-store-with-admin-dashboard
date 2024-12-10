import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { updatedOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, updatedOrderStatus);
router.get("/send-order-status-email", protectRoute, adminRoute);
router.put("/:orderId/status", protectRoute, adminRoute, updatedOrderStatus);

export default router;
