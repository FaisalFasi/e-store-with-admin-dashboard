import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId instead of String
      ref: "User", // Reference to the User model
      required: false, // Optional field for guest users
    },
    // orderId: { type: String, required: false }, // To link the address with an order
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^[+]?[1-9]\d{1,14}$/.test(value), // E.164 format
        message: "Invalid phone number format",
      },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const UserAddress = mongoose.model("Address", addressSchema);

export default UserAddress;
