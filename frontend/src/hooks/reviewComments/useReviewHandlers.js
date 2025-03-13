import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export const useReviewHandlers = (
  user,
  createReview,
  updateReview,
  deleteReview,
  markHelpful
) => {
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    body: "",
  });

  const [editingReviewId, setEditingReviewId] = useState(null);

  const handleReviewSubmit = useCallback(
    async (productId, userReview) => {
      if (!user) {
        toast.error("Please login to submit a review");
        return;
      }

      if (userReview && !editingReviewId) {
        toast.error("You have already submitted a review for this product.");
        return;
      }

      try {
        if (editingReviewId) {
          await updateReview(editingReviewId, newReview);
          setEditingReviewId(null);
        } else {
          await createReview({
            product: productId,
            user: user._id,
            ...newReview,
          });
        }
        setNewReview({ rating: 0, title: "", body: "" });
      } catch (error) {
        toast.error(error.message || "Failed to submit review");
      }
    },
    [user, editingReviewId, newReview, createReview, updateReview]
  );

  const handleEditReview = useCallback((review) => {
    setNewReview({
      rating: review.rating,
      title: review.title,
      body: review.body,
    });
    setEditingReviewId(review._id);
  }, []);

  const handleHelpful = useCallback(
    async (review) => {
      if (!user) {
        toast.error("Please login to mark helpful.");
        return;
      }

      try {
        await markHelpful(review._id, user?._id);
      } catch (error) {
        toast.error(error.message || "Failed to mark helpful");
      }
    },
    [user, markHelpful]
  );

  const handleDeleteReview = useCallback(
    async (reviewId) => {
      try {
        await deleteReview(reviewId);
      } catch (error) {
        toast.error(error.message || "Failed to delete review");
      }
    },
    [deleteReview]
  );

  return {
    newReview,
    setNewReview,
    editingReviewId,
    handleReviewSubmit,
    handleEditReview,
    handleHelpful,
    handleDeleteReview,
  };
};
