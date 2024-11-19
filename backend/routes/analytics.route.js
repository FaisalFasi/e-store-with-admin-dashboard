import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getSalesData } from "../controllers/analytic.controller.js";
import limiter from "../middleware/limiter.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, limiter, getSalesData);

export default router;
