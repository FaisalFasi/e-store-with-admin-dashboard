import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { getUserData } from "@utils/getUserData.js";
import { useReviewCommentStore } from "../../../stores/useReviewCommentStore";

const ReviewCommentSection = ({ productId }) => {
  const { user } = getUserData();
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    body: "",
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [showReply, setShowReply] = useState({});

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

  const userReview = useMemo(
    () => reviews?.find((review) => review.user?._id === user?.id),
    [reviews, user]
  );

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
        toast.success("Review updated successfully!");
        setEditingReviewId(null);
      } else {
        await createReview({ product: productId, user: user.id, ...newReview });
        toast.success("Review submitted successfully!");
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
        toast.success("Comment added successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to add comment");
      }
    },
    [newComment, user, createComment]
  );

  const handleHelpful = useCallback(
    async (reviewId) => {
      if (!user) {
        toast.error("Please login to mark helpful.");
        return;
      }

      try {
        await markHelpful(reviewId, user.id);
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
        toast.success("Deleted successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to delete");
      }
    },
    [deleteComment, deleteReview]
  );

  const toggleReplyForm = useCallback((commentId) => {
    setShowReply((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  }, []);

  return (
    <section className="mt-12">
      <h3 className="text-2xl text-emerald-400 mb-6">Customer Reviews</h3>
      {(!userReview || editingReviewId) && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() =>
                    setNewReview((prev) => ({ ...prev, rating: star }))
                  }
                  className={`text-xl ${
                    star <= newReview.rating
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Review title"
              value={newReview.title}
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 bg-gray-700 rounded text-white"
            />
            <textarea
              placeholder="Write your review..."
              value={newReview.body}
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, body: e.target.value }))
              }
              className="w-full p-2 bg-gray-700 rounded text-white"
              rows="4"
            />
            <button
              onClick={handleReviewSubmit}
              className="ml-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : editingReviewId
                ? "Update Review"
                : "Submit Review"}
            </button>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-800 p-6 rounded-lg">
            <div className="border-b border-gray-700 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={review?.user?.avatar}
                  alt={review?.user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-emerald-400">
                  {review?.user?.name}
                </span>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {(user?.isAdmin || user?.id === review?.user?._id) && (
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <h4 className="text-lg text-white mb-2">{review.title}</h4>
              <p className="text-gray-300">{review.body}</p>
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Helpful ({review.helpfulVotes})
                </button>
              </div>
            </div>
            <div className="ml-8 space-y-4">
              {comments[review._id]?.map((comment) => (
                <CommentTree
                  key={comment._id}
                  comment={comment}
                  onDelete={handleDelete}
                  user={user}
                  showReply={showReply[comment._id]}
                  onReply={(content) =>
                    handleCommentSubmit(review._id, comment._id, content)
                  }
                  toggleReply={() => toggleReplyForm(comment._id)}
                />
              ))}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newComment[review._id] || ""}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [review._id]: e.target.value,
                    }))
                  }
                  placeholder="Write a comment..."
                  className="flex-1 p-2 bg-gray-700 rounded text-white"
                  disabled={loading}
                />
                <button
                  onClick={() => handleCommentSubmit(review._id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CommentTree = ({
  comment,
  onDelete,
  user,
  showReply,
  onReply,
  toggleReply,
}) => {
  const [replyContent, setReplyContent] = useState("");

  return (
    <div className="border-l-2 border-emerald-600 pl-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-emerald-400">
          {comment.user.name}
          {comment.user.isAdmin && (
            <span className="ml-2 px-2 py-1 bg-emerald-600 text-xs rounded">
              Admin
            </span>
          )}
        </span>
        <span className="text-gray-400 text-sm">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
        {(user?.isAdmin || user?.id === comment.user._id) && (
          <button
            onClick={() => onDelete(comment._id)}
            className="ml-auto text-red-400 hover:text-red-500"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-gray-300">{comment.content}</p>
      {user?.isAdmin && (
        <button onClick={toggleReply} className="text-sm text-emerald-400 mt-1">
          {showReply ? "Hide Reply" : "Reply"}
        </button>
      )}
      {showReply && user?.isAdmin && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 p-2 bg-gray-700 rounded text-white text-sm"
          />
          <button
            onClick={() => {
              onReply(replyContent);
              setReplyContent("");
              toggleReply();
            }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
          >
            Send
          </button>
        </div>
      )}
      {comment.replies?.map((reply) => (
        <CommentTree
          key={reply._id}
          comment={reply}
          onDelete={onDelete}
          user={user}
          showReply={showReply[reply._id]}
          onReply={onReply}
          toggleReply={() => toggleReply(reply._id)}
        />
      ))}
    </div>
  );
};

export default ReviewCommentSection;
