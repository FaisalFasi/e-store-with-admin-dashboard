import asyncHandler from "express-async-handler";
import Review from "../models/review.model.js";
import { handleError } from "../utils/handleError/handleError.js";

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
  try {
    const productId = req.params.productId;
    console.log(" productId in getProductReviews: ", productId);
    if (!productId) {
      handleError(res, "Product ID is required", "Failed to fetch reviews");
    }
    // Use find instead of findById to query by the product field
    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    console.log("reviews in getProductReviews: ", reviews);

    res.status(200).json(reviews);
  } catch (error) {
    console.log("error in getProductReviews: ", error);
    handleError(res, error, "Failed to fetch reviews");
  }
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
// export const markHelpful = asyncHandler(async (req, res) => {
//   const review = await Review.findById(req.params.id);
//   review.helpfulVotes += 1;
//   await review.save();
//   res.json(review);
// });

export const markHelpful = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;
  const { userId } = req.body;

  console.log("userId in markHelpful: ", userId);
  console.log("reviewId in markHelpful: ", reviewId);

  try {
    const review = await Review.findById(reviewId);
    console.log("review in markHelpful: ", review);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ensure helpfulVotesByUsers does not contain null values
    review.helpfulVotesByUsers = review.helpfulVotesByUsers.filter(
      (id) => id !== null
    );

    // Check if the user has already voted
    const hasUserVoted = review.helpfulVotesByUsers.includes(userId);
    console.log("hasUserVoted in markHelpful: ", hasUserVoted);

    if (hasUserVoted) {
      // Remove the user's vote
      review.helpfulVotesByUsers = review.helpfulVotesByUsers.filter(
        (id) => id.toString() !== userId
      );
      review.helpfulVotes -= 1;
    } else {
      // Add the user's vote
      review.helpfulVotesByUsers.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();

    res.status(200).json({
      message: hasUserVoted ? "Removed helpful vote!" : "Marked as helpful!",
      helpfulVotes: review.helpfulVotes,
      hasUserVoted: !hasUserVoted, // Return the new state
    });
  } catch (error) {
    console.error("Error in markHelpful:", error);
    handleError(res, error, "Failed to mark helpful");
  }
});
