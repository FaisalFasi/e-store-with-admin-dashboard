// components/ReviewCommentSection.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getUserData } from "@utils/getUserData.js";
import { useReviewCommentStore } from "../../../stores/useReviewCommentStore.js";

const ReviewCommentSection = ({ productId }) => {
  const { user } = getUserData();
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    body: "",
  });
  const [newComment, setNewComment] = useState({});
  const [showReply, setShowReply] = useState({});

  // Zustand Store
  const {
    reviews,
    comments,
    loading,
    fetchProductReviews,
    createReview,
    markHelpful,
    fetchComments,
    createComment,
    deleteReview,
    deleteComment,
  } = useReviewCommentStore();

  // Fetch reviews when component mounts
  useEffect(() => {
    fetchProductReviews(productId);
  }, [productId, fetchProductReviews]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    try {
      await createReview({
        product: productId,
        user: user.id,
        ...newReview,
      });
      setNewReview({ rating: 0, title: "", body: "" });
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (reviewId, parentCommentId = null) => {
    const content = newComment[reviewId]?.trim();
    if (!content) return;

    try {
      await createComment({
        review: reviewId,
        user: user.id,
        content,
        parentComment: parentCommentId,
      });
      setNewComment({ ...newComment, [reviewId]: "" });
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  // Handle helpful vote
  const handleHelpful = async (reviewId) => {
    try {
      await markHelpful(reviewId);
      toast.success("Marked as helpful!");
    } catch (error) {
      toast.error(error.message || "Failed to mark helpful");
    }
  };

  // Handle deletion
  const handleDelete = async (reviewId, commentId = null) => {
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
  };

  // Toggle reply form visibility
  const toggleReplyForm = (commentId) => {
    setShowReply((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <section className="mt-12">
      <h3 className="text-2xl text-emerald-400 mb-6">Customer Reviews</h3>

      {/* New Review Form */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewReview({ ...newReview, rating: star })}
                className={`text-xl ${
                  star <= newReview.rating ? "text-yellow-400" : "text-gray-500"
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
              setNewReview({ ...newReview, title: e.target.value })
            }
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
          <textarea
            placeholder="Write your review..."
            value={newReview.body}
            onChange={(e) =>
              setNewReview({ ...newReview, body: e.target.value })
            }
            className="w-full p-2 bg-gray-700 rounded text-white"
            rows="4"
          />
          <button
            onClick={handleReviewSubmit}
            className="ml-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-800 p-6 rounded-lg">
            {/* Review Header */}
            <div className="border-b border-gray-700 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-emerald-400">
                  {review.user.name}
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
                {(user?.isAdmin || user?.id === review.user._id) && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="ml-auto text-red-400 hover:text-red-500"
                  >
                    Delete
                  </button>
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

            {/* Comments Section */}
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

              {/* New Comment Form */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newComment[review._id] || ""}
                  onChange={(e) =>
                    setNewComment({
                      ...newComment,
                      [review._id]: e.target.value,
                    })
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

// Recursive Comment Component
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

      {/* Reply Button */}
      {user && (
        <button onClick={toggleReply} className="text-sm text-emerald-400 mt-1">
          {showReply ? "Hide Reply" : "Reply"}
        </button>
      )}

      {/* Reply Form */}
      {showReply && (
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

      {/* Nested Replies */}
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
