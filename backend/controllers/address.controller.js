import UserAddress from "../models/address.model.js";

export const saveShippingAddress = async (req, res) => {
  try {
    const userId = req.user?._id; // Check if userId exists (for logged-in users)

    const { fullName, street, city, state, postalCode, country, phoneNumber } =
      req.body;

    // Construct the address object
    const address = {
      userId,
      fullName,
      street,
      city,
      state,
      zip: postalCode,
      country,
      phoneNumber,
    };

    // Validate required fields
    for (const [key, value] of Object.entries(address)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    if (!userId) {
      // Handle guest users
      const guestAddress = new UserAddress({ ...address }); // Use `orderId` if provided
      const savedAddress = await guestAddress.save();

      return res.status(201).json({
        address: savedAddress,
        message: "Guest address saved successfully",
      });
    }

    // For logged-in users
    const existingAddress = await UserAddress.findOne({ userId });

    if (existingAddress) {
      // Update existing address if it exists
      const updatedAddress = await UserAddress.findOneAndUpdate(
        { userId },
        { $set: address },
        { new: true }
      );

      return res.status(200).json({
        address: updatedAddress,
        message: "Address updated successfully",
      });
    } else {
      // Create a new address if none exists
      const newAddress = new UserAddress({ ...address });
      const savedAddress = await newAddress.save();

      return res.status(201).json({
        address: savedAddress,
        message: "Address saved successfully",
      });
    }
  } catch (error) {
    console.error("Error saving address:", error);
    return res.status(500).json({ message: "Address saving failed", error });
  }
};
