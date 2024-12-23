import express from "express";
import { saveShippingAddress } from "../controllers/address.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, saveShippingAddress);

export default router;
