import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Core Relationships
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // Review Content
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating cannot be less than 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer",
      },
    },
    title: {
      type: String,
      maxlength: [120, "Title cannot exceed 120 characters"],
      trim: true,
    },
    body: {
      type: String,
      maxlength: [2000, "Review cannot exceed 2000 characters"],
      trim: true,
    },
    media: [
      {
        type: String,
        validate: {
          validator: (urls) => urls.length <= 4,
          message: "Maximum 4 images/videos allowed",
        },
      },
    ],

    // Verification & Stats
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    helpfulVotesByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reported: {
      type: Boolean,
      default: false,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search optimization
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, createdAt: -1 });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
// Middleware to delete comments when a review is deleted
reviewSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const reviewId = this._id;

    // Delete all comments associated with this review
    await mongoose.model("Comment").deleteMany({ review: reviewId });

    next();
  }
);

reviewSchema.methods.toggleHelpfulVote = async function (userId) {
  const index = this.helpfulVotesByUsers.indexOf(userId);

  if (index === -1) {
    // User hasn't voted yet, add their vote
    this.helpfulVotesByUsers.push(userId);
    this.helpfulVotes += 1;
  } else {
    // User has already voted, remove their vote
    this.helpfulVotesByUsers.splice(index, 1);
    this.helpfulVotes -= 1;
  }

  await this.save();
  return this;
};

// Virtual for comments
reviewSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "review",
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
