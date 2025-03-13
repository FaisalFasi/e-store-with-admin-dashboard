import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export const useCommentHandlers = (
  user,
  createComment,
  updateComment,
  deleteComment
) => {
  const [newComment, setNewComment] = useState({
    content: "", // For new comments
    editingCommentId: null, // ID of the comment being edited
    editingContent: "", // Content of the comment being edited
  });

  const handleEditComment = useCallback((comment) => {
    setNewComment((prev) => ({
      ...prev,
      editingCommentId: comment._id,
      editingContent: comment.content,
    }));
  }, []);

  const handleCommentSubmit = useCallback(
    async (reviewId, parentCommentId = null, content) => {
      if (!content) return toast.error("Please enter a comment");

      try {
        if (newComment.editingCommentId) {
          // Update existing comment
          await updateComment(newComment.editingCommentId, {
            content: newComment.editingContent,
          });
          setNewComment({
            content: "",
            editingCommentId: null,
            editingContent: "",
          });
        } else {
          // Create new comment
          await createComment({
            review: reviewId,
            user: user.id,
            content,
            parentComment: parentCommentId,
          });
          setNewComment((prev) => ({ ...prev, content: "" }));
        }
      } catch (error) {
        toast.error(error.message || "Failed to submit comment");
      }
    },
    [newComment, user, createComment, updateComment]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        await deleteComment(commentId);
      } catch (error) {
        toast.error(error.message || "Failed to delete comment");
      }
    },
    [deleteComment]
  );

  return {
    newComment,
    setNewComment,
    handleEditComment,
    handleCommentSubmit,
    handleDeleteComment,
  };
};
