import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: false, // Optional field for guest users
    },

    // Address Details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false, // Make it optional
      validate: {
        validator: (value) => /^[+]?\d{1,20}$/.test(value), // Allows up to 20 digits with optional '+' prefix
        message:
          "Phone number must be up to 20 digits and can start with a '+'",
      },
    },

    // Address Type (e.g., Home, Office)
    addressType: {
      type: String,
      enum: ["Home", "Office", "Other"], // Predefined address types
      default: "Home",
    },

    // Default Address Flag
    isDefault: {
      type: Boolean,
      default: false, // Indicates if this is the user's default address
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
addressSchema.index({ userId: 1 });
addressSchema.index({ isDefault: 1 });
addressSchema.index({ country: 1, state: 1, city: 1 });

const UserAddress = mongoose.model("Address", addressSchema);
export default UserAddress;
