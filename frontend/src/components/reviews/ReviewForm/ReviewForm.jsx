import React, { useState } from "react";

const ReviewForm = ({
  user,
  userReview,
  editingReviewId,
  newReview,
  setNewReview,
  handleReviewSubmit,
  loading,
}) => {
  if (!user || (userReview && !editingReviewId)) return null;

  return (
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
  );
};

export default React.memo(ReviewForm);
