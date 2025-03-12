import React, { useState } from "react";
import CommentTree from "../CommentTree/CommentTree";

const ReviewItem = ({
  review,
  user,
  comments,
  newComment,
  setNewComment,
  handleCommentSubmit,
  handleEditReview,
  handleDelete,
  handleHelpful,
  loading,
}) => {
  const [showReply, setShowReply] = useState({});

  const toggleReplyForm = (commentId) => {
    setShowReply((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };
  console.log("ReviewItem -> review", review);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="border-b border-gray-700 pb-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <img
                src={review?.user?.avatar}
                alt={review?.user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold text-emerald-400">
                {review?.user?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
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
            </div>
          </div>

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
        <h4 className="text-xl text-white mb-2">{review?.title}</h4>
        <p className="text-gray-300">{review?.body}</p>
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => handleHelpful(review, user)}
            className="text-gray-400 hover:text-emerald-400"
          >
            Helpful ({review?.helpfulVotes})
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {comments[review?._id]?.map((comment) => (
          <CommentTree
            key={comment._id}
            comment={comment}
            onDelete={() => handleDelete(null, comment._id)}
            user={user}
            showReply={showReply[comment._id]}
            onReply={(content) =>
              handleCommentSubmit(review?._id, comment._id, content)
            }
            toggleReply={() => toggleReplyForm(comment._id)}
          />
        ))}
        {user?.role === "admin" && (
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
        )}
      </div>
    </div>
  );
};

export default React.memo(ReviewItem);
