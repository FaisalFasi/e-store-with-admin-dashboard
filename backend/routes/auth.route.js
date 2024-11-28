import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import limiter from "../middleware/limiter.js";
import { verifyCaptcha } from "../middleware/recaptchaMiddleware.js";

const router = express.Router();

router.post("/signup", verifyCaptcha, limiter, signup);
router.post("/login", verifyCaptcha, limiter, login);
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
// for resetting password
router.post("/request-forgot-password", requestPasswordReset);
router.post("/reset-password/:resetToken", resetPassword);

export default router;
