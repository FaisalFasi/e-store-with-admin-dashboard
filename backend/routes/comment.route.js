import express from "express";
import {
  createComment,
  deleteComment,
  getReplies,
  updateComment,
} from "../controllers/comment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").post(protectRoute, createComment);
router.route("/replies/:commentId").get(getReplies);

router
  .route("/:id")
  .put(protectRoute, updateComment)
  .delete(protectRoute, deleteComment);

export default router;
