import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getSalesData } from "../controllers/analytic.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getSalesData);

export default router;
