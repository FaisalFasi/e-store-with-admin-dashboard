import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // Optional for guest users
  orderId: { type: String, required: false }, // To link the address with an order
  street: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserAddress = mongoose.model("Address", addressSchema);

export default UserAddress;
