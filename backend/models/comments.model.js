// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "parentModel", // Dynamic reference (Review or Comment)
    },
    parentModel: {
      type: String,
      enum: ["Review", "Comment"],
      required: true,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
