import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";

export const useReviewCommentStore = create((set, get) => ({
  // State
  reviews: [],
  comments: {},
  loading: false,
  error: null,

  // Actions
  fetchProductReviews: async (productId) => {
    console.log("productId in fetchProductReviews: ", productId);
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.get(`/reviews/product/${productId}`);
      console.log("Data from fetchProductReviews: ", response.data);
      set({ reviews: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch reviews",
        loading: false,
      });
      toast.error("Failed to load reviews");
    }
  },

  createReview: async (reviewData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.post("/reviews", reviewData);
      set((state) => ({
        reviews: [response.data, ...state.reviews],
        loading: false,
      }));
      toast.success("Review submitted successfully!");
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create review",
        loading: false,
      });
      toast.error("Failed to submit review");
      throw error;
    }
  },

  updateReview: async (reviewId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.put(
        `/reviews/${reviewId}`,
        updateData
      );
      set((state) => ({
        reviews: state.reviews.map((review) =>
          review._id === reviewId ? response.data : review
        ),
        loading: false,
      }));
      toast.success("Review updated successfully!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update review",
        loading: false,
      });
      toast.error("Failed to update review");
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    set({ loading: true, error: null });
    try {
      await axiosBaseURL.delete(`/reviews/${reviewId}`);
      set((state) => ({
        reviews: state.reviews.filter((review) => review._id !== reviewId),
        loading: false,
      }));
      toast.success("Review deleted successfully!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete review",
        loading: false,
      });
      toast.error("Failed to delete review");
      throw error;
    }
  },

  markHelpful: async (reviewId, userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.post(`/reviews/${reviewId}/helpful`, {
        userId,
      });
      set((state) => ({
        reviews: state.reviews.map((review) =>
          review._id === reviewId ? response.data : review
        ),
        loading: false,
      }));
      toast.success("Marked as helpful!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to mark helpful",
        loading: false,
      });
      toast.error("Failed to mark helpful");
      throw error;
    }
  },

  fetchComments: async (reviewId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.get(`/comments/replies/${reviewId}`);
      set((state) => ({
        comments: {
          ...state.comments,
          [reviewId]: response.data,
        },
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch comments",
        loading: false,
      });
      toast.error("Failed to load comments");
      throw error;
    }
  },

  createComment: async (commentData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.post("/comments", commentData);
      set((state) => ({
        comments: {
          ...state.comments,
          [commentData.review]: [
            response.data,
            ...(state.comments[commentData.review] || []),
          ],
        },
        loading: false,
      }));
      toast.success("Comment added successfully!");
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create comment",
        loading: false,
      });
      toast.error("Failed to add comment");
      throw error;
    }
  },

  updateComment: async (commentId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosBaseURL.put(
        `/comments/${commentId}`,
        updateData
      );
      set((state) => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([reviewId, comments]) => [
            reviewId,
            comments.map((comment) =>
              comment._id === commentId ? response.data : comment
            ),
          ])
        ),
        loading: false,
      }));
      toast.success("Comment updated successfully!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update comment",
        loading: false,
      });
      toast.error("Failed to update comment");
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    set({ loading: true, error: null });
    try {
      await axiosBaseURL.delete(`/comments/${commentId}`);
      set((state) => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([reviewId, comments]) => [
            reviewId,
            comments.filter((comment) => comment._id !== commentId),
          ])
        ),
        loading: false,
      }));
      toast.success("Comment deleted successfully!");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete comment",
        loading: false,
      });
      toast.error("Failed to delete comment");
      throw error;
    }
  },
}));
