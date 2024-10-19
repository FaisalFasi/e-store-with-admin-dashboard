import Coupon from "../models/coupen.model";

export const getCoupon = async (req, res) => {
  try {
    const coupen = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.status(200).json(coupen || {});
  } catch (err) {
    console.log("Error in getCoupen controller : ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;
    const coupon = await Coupon.findOne({
      code: code,
      userId: user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid Coupon" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: "Coupon Expired" });
    }

    res.status(200).json({
      message: "Coupone is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (err) {
    console.log("Error in validateCoupon controller : ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};
