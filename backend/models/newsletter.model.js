import mongoose from "mongoose";

const newsLettersSubscribersSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const NewsLetter = mongoose.model(
  "NewsletterSubscriber",
  newsLettersSubscribersSchema
);

export default NewsLetter;
