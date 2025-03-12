import asyncHandler from "express-async-handler";
import Review from "../models/review.model.js";
import { handleError } from "../utils/handleError/handleError.js";
import mongoose from "mongoose";

// Create Review
export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, body, media } = req.body;

  if (!product || !rating) {
    // 406 Not Acceptable
    return handleError(
      res,
      { message: "Product and rating are required" },
      "error occured in create review",
      406
    );
  }

  const existingReview = await Review.findOne({
    product,
    user: req.user.id,
  });

  if (existingReview) {
    // 403 Forbidden
    return handleError(
      res,
      { message: "Review already exists" },
      "error occured in create review",
      400
    );
  }

  let review = await Review.create({
    product,
    user: req.user.id,
    rating,
    title,
    body,
    media,
    verifiedPurchase: false, // Update this based on actual purchase verification
  });
  review = await review.populate("user", "name avatar role").populate({
    path: "comments",
    populate: {
      path: "user",
      select: " name avatar",
    },
  });

  res.status(201).json({ review });
});

// Get Product Reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    handleError(res, "Invalid product ID", 400);
  }

  // Fetch reviews with pagination (optional)
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: productId })
    .populate("user", "name avatar")
    .populate({
      path: "comments",
      match: { isDeleted: false }, // Only show comments that are not deleted
      populate: {
        path: "user",
        select: " name avatar",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Count total reviews for pagination metadata
  const totalReviews = await Review.countDocuments({ product: productId });

  res.status(200).json({
    reviews,
    totalReviews,
    currentPage: page,
    totalPages: Math.ceil(totalReviews / limit),
  });
});
// Update Review
export const updateReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;
  const updates = req.body;

  // Validate reviewId
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400);
    throw new Error("Invalid review ID");
  }

  // Find the review
  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if the user is authorized to update the review
  if (review.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to update this review");
  }

  // Update the review
  const updatedReview = await Review.findByIdAndUpdate(reviewId, updates, {
    new: true,
    runValidators: true, // Ensure updates are validated
  });

  res.status(200).json(updatedReview);
});

// Delete Review
export const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  console.log("reviewId", reviewId);
  // Validate reviewId
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400);
    throw new Error("Invalid review ID");
  }

  // Find the review
  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if the user is authorized to delete the review
  if (review.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to delete this review");
  }

  // Delete the review
  await review.deleteOne();

  res.status(200).json({ message: "Review removed" });
});

export const markHelpful = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;
  const { userId } = req.body;

  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(reviewId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ message: "Invalid review or user ID" });
  }

  try {
    // Find the review and update it atomically
    let review = await Review.findOneAndUpdate(
      { _id: reviewId },
      [
        {
          $set: {
            helpfulVotes: {
              $cond: {
                if: {
                  $in: [
                    new mongoose.Types.ObjectId(userId),
                    "$helpfulVotesByUsers",
                  ],
                },
                then: { $subtract: ["$helpfulVotes", 1] }, // Decrement if user already voted
                else: { $add: ["$helpfulVotes", 1] }, // Increment if user hasn't voted
              },
            },
            helpfulVotesByUsers: {
              $cond: {
                if: {
                  $in: [
                    new mongoose.Types.ObjectId(userId),
                    "$helpfulVotesByUsers",
                  ],
                },
                then: {
                  $setDifference: [
                    "$helpfulVotesByUsers",
                    [new mongoose.Types.ObjectId(userId)],
                  ],
                }, // Remove user ID
                else: {
                  $concatArrays: [
                    "$helpfulVotesByUsers",
                    [new mongoose.Types.ObjectId(userId)],
                  ],
                }, // Add user ID
              },
            },
          },
        },
      ],
      { new: true } // Return the updated document
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review = await review.populate("user", "name avatar role");
    // Determine if the user has voted after the update
    const hasUserVoted = review.helpfulVotesByUsers.includes(userId);

    res.status(200).json({
      message: hasUserVoted ? "Marked as helpful!" : "Removed helpful vote!",
      helpfulVotes: review.helpfulVotes,
      hasUserVoted, // Return the current state
      review, // Return the full review object for frontend consistency
    });
  } catch (error) {
    console.error("Error in markHelpful:", error);
    res
      .status(500)
      .json({ message: "Failed to mark helpful", error: error.message });
  }
});

// Check if the user has reviewed a product
export const hasUserReviewedProduct = asyncHandler(async (req, res) => {
  const { productId, userId } = req.params;

  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ message: "Invalid product or user ID" });
  }

  try {
    const review = await Review.findOne({ product: productId, user: userId });

    res.status(200).json({ hasReviewed: !!review });
  } catch (error) {
    console.error("Error in hasUserReviewedProduct:", error);
    res
      .status(500)
      .json({ message: "Failed to check review status", error: error.message });
  }
});
