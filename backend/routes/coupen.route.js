import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupen } from "../controllers/coupen.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCoupen);
