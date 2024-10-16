import Coupon from "../models/coupen.model";

export const getCoupen = async (req, res) => {
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
