import Review from "../models/review.model.js";
import asyncHandler from "express-async-handler";

// Create Review
export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, body, media } = req.body;

  const review = await Review.create({
    product,
    user: req.user.id,
    rating,
    title,
    body,
    media,
    verifiedPurchase: false, // Update this based on actual purchase verification
  });

  res.status(201).json(review);
});

// Get Product Reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// Update Review
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to update this review");
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedReview);
});

// Delete Review
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to delete this review");
  }

  await review.deleteOne();
  res.json({ message: "Review removed" });
});

// Mark Helpful
export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  review.helpfulVotes += 1;
  await review.save();
  res.json(review);
});
