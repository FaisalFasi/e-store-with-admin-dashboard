import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getUserData } from "@/utils/getUserData";
import { useReviewCommentStore } from "@/stores/useReviewCommentStore";
import ReviewItem from "../ReviewItem/ReviewItem";
import ReviewForm from "../ReviewForm/ReviewForm";
import { useCommentHandlers } from "@/hooks/reviewComments/useCommentHandlers"; // Import the custom hook
import { useReviewHandlers } from "@/hooks/reviewComments/useReviewHandlers"; // Import the custom hook

const ReviewCommentSection = ({ productId }) => {
  const { user } = getUserData();

  const {
    // store state
    reviews,
    comments,
    loading,
    error,
    // store actions
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    createComment,
    updateComment,
    deleteComment,
  } = useReviewCommentStore();

  // Use the custom hook for review-related logic
  const {
    newReview,
    setNewReview,
    editingReviewId,
    handleReviewSubmit,
    handleEditReview,
    handleHelpful,
    handleDeleteReview,
  } = useReviewHandlers(
    user,
    createReview,
    updateReview,
    deleteReview,
    markHelpful
  );

  // Use the custom hook for comment-related logic
  const {
    newComment,
    setNewComment,
    handleEditComment,
    handleCommentSubmit,
    handleDeleteComment,
  } = useCommentHandlers(user, createComment, updateComment, deleteComment);

  useEffect(() => {
    if (productId) {
      fetchProductReviews(productId).catch((error) => {
        toast.error(error.message || "Failed to fetch reviews");
      });
    }
  }, [productId, fetchProductReviews]);

  const userReview = useMemo(() => {
    return reviews?.find((review) => review.user?._id === user?._id);
  }, [reviews, user]);

  const handleDelete = useCallback(
    async (reviewId, commentId = null) => {
      try {
        if (commentId) {
          await handleDeleteComment(commentId); // Use the custom hook's delete function
        } else {
          await handleDeleteReview(reviewId); // Use the custom hook's delete function
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete");
      }
    },
    [handleDeleteComment, handleDeleteReview]
  );

  return (
    <section className="mt-12">
      <h3 className="text-2xl text-emerald-400 mb-6">Customer Reviews</h3>
      <ReviewForm
        user={user}
        userReview={userReview}
        editingReviewId={editingReviewId}
        updateComment={updateComment}
        newReview={newReview}
        setNewReview={setNewReview}
        handleReviewSubmit={() => handleReviewSubmit(productId, userReview)}
        loading={loading}
      />
      <div className="space-y-6">
        {reviews?.map((review, index) => (
          <ReviewItem
            key={review?._id || index}
            review={review}
            user={user}
            comments={comments}
            newComment={newComment}
            updateComment={updateComment}
            setNewComment={setNewComment}
            handleCommentSubmit={handleCommentSubmit}
            handleEditComment={handleEditComment}
            handleEditReview={handleEditReview}
            handleDelete={handleDelete}
            handleHelpful={handleHelpful}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
};

export default ReviewCommentSection;
