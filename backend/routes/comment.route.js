import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  updateComment,
  deleteComment,
  createComment,
  getReplies,
} from "../controllers/comment.controller";
const router = express.Router();

router.route("/").post(protectRoute, createComment);
router.route("/replies/:commentId").get(getReplies);

router
  .route("/:id")
  .put(protect, updateComment)
  .delete(protectRoute, deleteComment);

export default router;
