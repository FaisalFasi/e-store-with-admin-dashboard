import Comment from "../models/comment.model.js";
import asyncHandler from "express-async-handler";
import Review from "../models/review.model.js";

// Create Comment
export const createComment = asyncHandler(async (req, res) => {
  const { review: reviewId, content, parentComment } = req.body;

  let comment = await Comment.create({
    review: reviewId,
    user: req.user.id,
    content,
    parentComment: parentComment || null,
  });

  // Update review's comment count
  await Review.findByIdAndUpdate(reviewId, { $inc: { commentCount: 1 } });

  comment = await comment.populate("user", "name avatar role");
  res.status(201).json(comment);
});

// Get Comment Replies
export const getReplies = asyncHandler(async (req, res) => {
  const comments = await Comment.find({
    parentComment: req.params.commentId,
  }).populate("user", "name avatar role");

  res.json(comments);
});

// Update Comment
export const updateComment = asyncHandler(async (req, res) => {
  let comment = await Comment.findById(req.params.id);

  if (comment.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to update this comment");
  }

  comment.content = req.body.content || comment.content;
  comment.isEdited = true;

  comment = await comment.populate("user", "name avatar role");

  await comment.save();

  res.json(comment);
});

// Delete Comment
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  console.log("comment : ", comment);

  if (comment.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to delete this comment");
  }

  comment.isDeleted = true;
  await comment.save();

  // Update review's comment count
  await Review.findByIdAndUpdate(comment.review, {
    $inc: { commentCount: -1 },
  });

  res.json({ message: "Comment marked as deleted" });
});
