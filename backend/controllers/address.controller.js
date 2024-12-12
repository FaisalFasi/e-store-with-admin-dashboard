export const saveAddress = async (req, res) => {
  try {
    const { userId, address, orderId } = req.body;

    if (!userId) {
      // Handle guest user
      const guestAddress = new UserAddress({ orderId, ...address });
      const savedAddress = await guestAddress.save();

      return res.status(201).json({
        address: savedAddress,
        message: "Guest address saved successfully",
      });
    }

    // Existing logic for registered users
    const existingAddress = await UserAddress.findOne({ userId });
    if (existingAddress) {
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
      const newAddress = new UserAddress({ userId, ...address });
      const savedAddress = await newAddress.save();

      return res.status(201).json({
        address: savedAddress,
        message: "Address saved successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Address saving failed", error });
  }
};
