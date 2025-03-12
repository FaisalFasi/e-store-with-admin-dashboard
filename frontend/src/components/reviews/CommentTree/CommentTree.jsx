import React, { useState } from "react";

const CommentTree = ({
  comment,
  onDelete,
  user,
  showReply,
  onReply,
  toggleReply,
}) => {
  const [replyContent, setReplyContent] = useState("");
  console.log("CommentTree -> comment", comment);

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
            onClick={() => onDelete(null, comment?._id)}
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
      {comment?.replies?.map((reply) => (
        <CommentTree
          key={reply._id}
          comment={reply}
          onDelete={() => onDelete(null, reply._id)}
          user={user}
          showReply={showReply[reply._id]}
          onReply={onReply}
          toggleReply={() => toggleReply(reply._id)}
        />
      ))}
    </div>
  );
};

export default React.memo(CommentTree);
