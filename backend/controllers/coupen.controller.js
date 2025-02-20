import Coupon from "../models/coupen.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
      expirationDate: { $gt: new Date() }, // Ensure coupon is not expired
    });

    if (!coupon) {
      return res.status(404).json({ message: "No active coupon found" });
    }

    res.status(200).json(coupon);
  } catch (err) {
    console.log("Error in getCoupon controller: ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    // Find the coupon
    const coupon = await Coupon.findOne({
      code: code,
      userId: user._id,
      isActive: true,
      expirationDate: { $gt: new Date() }, // Ensure coupon is not expired
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid Coupon" });
    }

    // Check if the coupon has reached its maximum usage limit
    if (coupon.usageCount >= coupon.maxUsage) {
      coupon.isActive = false; // Deactivate the coupon
      await coupon.save();
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Increment the usage count
    coupon.usageCount += 1;
    if (coupon.usageCount >= coupon.maxUsage) {
      coupon.isActive = false; // Deactivate the coupon if usage limit is reached
    }
    await coupon.save();

    res.status(200).json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (err) {
    console.log("Error in validateCoupon controller: ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const getCouponsForUser = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID

    // Fetch all active coupons for the user
    const coupons = await Coupon.find({
      userId: userId,
      isActive: true,
      expirationDate: { $gt: new Date() }, // Ensure the coupon is not expired
    });

    if (!coupons || coupons.length === 0) {
      return res.status(200).json([]); // Return an empty array if no coupons are found
    }

    res.status(200).json(coupons);
  } catch (err) {
    console.error("Error fetching user coupons:", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
