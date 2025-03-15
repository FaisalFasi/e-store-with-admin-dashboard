import React from "react";

const CommentTree = ({
  comment,
  onDelete,
  user,
  showReply,
  onReply,
  toggleReply,
  newComment,
  setNewComment,
  handleEditComment,
  handleCommentSubmit,
}) => {
  const isEditing = newComment.editingCommentId === comment._id;
  return (
    <div className="border-l-2 border-emerald-600 pl-4">
      <div className="flex items-center gap-2 mb-1 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400">
            {comment?.user?.name}
            {comment.user.role === "admin" && (
              <span className="ml-2 px-2 py-1 bg-emerald-600 color text-white text-xs rounded">
                Admin
              </span>
            )}
          </span>

          <span className="text-gray-400 text-sm">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        {(user?.role === "admin" || user?._id === comment?.user?._id) && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleEditComment(comment)}
              className="text-blue-400 hover:text-blue-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(null, comment?._id)}
              className="text-red-400 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newComment.editingContent}
            onChange={(e) =>
              setNewComment((prev) => ({
                ...prev,
                editingContent: e.target.value,
              }))
            }
            className="flex-1 p-2 bg-gray-700 rounded text-white text-sm"
          />
          <button
            onClick={() =>
              handleCommentSubmit(
                comment.review,
                null,
                newComment.editingContent
              )
            }
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
          >
            Save
          </button>
        </div>
      ) : (
        <div>
          <h2></h2>
          <p className="text-gray-300">{comment.content}</p>
        </div>
      )}
      {/* {user?.role === "admin" && (
        <button onClick={toggleReply} className="text-sm text-emerald-400 mt-1">
          {showReply ? "Hide Reply" : "Reply"}
        </button>
      )} */}
      {/* {showReply && user?.role === "admin" && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Write a reply..."
            className="flex-1 p-2 bg-gray-700 rounded text-white text-sm"
            value={newComment.content} // Use the newComment state for the input value
            onChange={(e) =>
              setNewComment((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
          />
          <button
            onClick={() => {
              handleCommentSubmit(
                comment.review,
                comment._id,
                newComment.content
              ); // Pass the parent comment ID
              setNewComment((prev) => {
                return { ...prev, content: "" };
              }); // Clear the input after submission
              toggleReply();
            }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
          >
            Send
          </button>
        </div>
      )} */}
      {/* {comment?.replies?.map((reply) => (
        <CommentTree
          key={reply._id}
          comment={reply}
          onDelete={() => onDelete(null, reply._id)}
          user={user}
          showReply={showReply[reply._id]}
          onReply={onReply}
          toggleReply={() => toggleReply(reply._id)}
          newComment={newComment}
          setNewComment={setNewComment}
          handleEditComment={handleEditComment}
          handleCommentSubmit={handleCommentSubmit}
        />
      ))} */}
    </div>
  );
};

export default CommentTree;
