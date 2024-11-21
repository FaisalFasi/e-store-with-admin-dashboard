import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import limiter from "../middleware/limiter.js";
import { verifyCaptcha } from "../middleware/recaptchaMiddleware.js";

const router = express.Router();

router.post("/signup", limiter, verifyCaptcha, signup);
router.post("/login", limiter, verifyCaptcha, login);
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

export default router;
