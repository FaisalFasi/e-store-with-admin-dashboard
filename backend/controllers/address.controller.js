import UserAddress from "../models/address.model.js";

export const saveShippingAddress = async (req, res) => {
  try {
    // const userId = req.user?._id?.toString(); // Check if userId exists (for logged-in users)
    const userId = req.user?._id; // Check if userId exists (for logged-in users)

    console.log("User ID:", userId);
    const {
      fullName,
      street,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      orderId,
    } = req.body;

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
      orderId, // Include orderId in the address object
    };
    console.log("Address received:", address);

    // Validate required fields
    for (const key in address) {
      if (!address[key] && key !== "orderId") {
        // Exclude `orderId` from validation
        return res.status(400).json({
          message: `${key} is required`,
        });
      }
    }

    console.log(
      "Address received:",
      address,
      "User ID:",
      userId,
      "Order ID:",
      orderId
    );

    if (!userId) {
      // Handle guest users
      const guestAddress = new UserAddress({ ...address }); // Use `orderId` if provided
      const savedAddress = await guestAddress.save();

      return res.status(201).json({
        address: savedAddress,
        message: "Guest address saved successfully",
      });
    }

    // Logic for registered users
    if (orderId) {
      // If orderId is provided, save it with the address
      const userOrderAddress = new UserAddress({ userId, ...address });
      const savedOrderAddress = await userOrderAddress.save();

      return res.status(201).json({
        address: savedOrderAddress,
        message: "Address with order saved successfully",
      });
    } else {
      // If no orderId is provided, update or create the default user address
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
    }
  } catch (error) {
    console.error("Error saving address:", error);
    return res.status(500).json({ message: "Address saving failed", error });
  }
};
