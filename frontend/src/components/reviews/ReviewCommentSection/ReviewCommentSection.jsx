import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { getUserData } from "@utils/getUserData.js";
import { useReviewCommentStore } from "@stores/useReviewCommentStore";
import ReviewItem from "../ReviewItem/ReviewItem";
import ReviewForm from "../ReviewForm/ReviewForm";

const ReviewCommentSection = ({ productId }) => {
  const { user } = getUserData();
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    body: "",
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newComment, setNewComment] = useState({});

  const {
    reviews,
    comments,
    loading,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    createComment,
    deleteComment,
  } = useReviewCommentStore();

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

  const handleReviewSubmit = useCallback(async () => {
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
  }, [
    user,
    userReview,
    editingReviewId,
    newReview,
    productId,
    updateReview,
    createReview,
  ]);

  const handleEditReview = useCallback((review) => {
    setNewReview({
      rating: review.rating,
      title: review.title,
      body: review.body,
    });
    setEditingReviewId(review._id);
  }, []);

  const handleCommentSubmit = useCallback(
    async (reviewId, parentCommentId = null) => {
      const content = newComment[reviewId]?.trim();
      if (!content) return;

      if (parentCommentId && !user?.isAdmin) {
        toast.error("Only admins can reply to comments.");
        return;
      }

      try {
        await createComment({
          review: reviewId,
          user: user.id,
          content,
          parentComment: parentCommentId,
        });
        setNewComment((prev) => ({ ...prev, [reviewId]: "" }));
      } catch (error) {
        toast.error(error.message || "Failed to add comment");
      }
    },
    [newComment, user, createComment]
  );

  const handleHelpful = useCallback(
    async (review, user) => {
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

  const handleDelete = useCallback(
    async (reviewId, commentId = null) => {
      try {
        if (commentId) {
          await deleteComment(commentId);
        } else {
          await deleteReview(reviewId);
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete");
      }
    },
    [deleteComment, deleteReview]
  );

  return (
    <section className="mt-12">
      <h3 className="text-2xl text-emerald-400 mb-6">Customer Reviews</h3>
      <ReviewForm
        user={user}
        userReview={userReview}
        editingReviewId={editingReviewId}
        newReview={newReview}
        setNewReview={setNewReview}
        handleReviewSubmit={handleReviewSubmit}
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
            setNewComment={setNewComment}
            handleCommentSubmit={handleCommentSubmit}
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
