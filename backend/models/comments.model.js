import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Core Relationships
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: [true, "Review ID is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    // Content
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      trim: true,
    },

    // Moderation
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for quick lookups
commentSchema.index({ review: 1, parentComment: 1 });
commentSchema.index({ createdAt: -1 });

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
