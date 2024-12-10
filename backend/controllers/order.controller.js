import Order from "../models/order.model.js";

export const getOrders = async (req, res) => {
  const { status, startDate, endDate, userId } = req.query;

  if (!status && (!startDate || !endDate)) {
    return res.status(400).json({ success: false, message: "Invalid query" });
  }

  const query = {};
  if (status) query.status = status; // Filter by status
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  if (userId) query.user = userId; // Filter by user

  try {
    const orders = await Order.find(query)
      .populate("user", "name email") // Populate user details
      .populate("products.product", "name price images") // Populate product details
      .sort({ createdAt: -1 }); // Latest orders first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

export const updatedOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, cancellationReason, dispatchedBy, deliveryEstimate } =
    req.body;

  // Validate order status
  if (!order_states.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  const mongoDB_session = await mongoose.startSession();
  mongoDB_session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(mongoDB_session);

    if (!order) {
      await mongoDB_session.abortTransaction();
      mongoDB_session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Handle status-specific updates
    if (status === "cancelled" && !cancellationReason) {
      await mongoDB_session.abortTransaction();
      mongoDB_session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required for a cancelled order",
      });
    }

    if (status === "dispatched" && (!dispatchedBy || !deliveryEstimate)) {
      await mongoDB_session.abortTransaction();
      mongoDB_session.endSession();
      return res.status(400).json({
        success: false,
        message: "Dispatched by and delivery estimate are required",
      });
    }

    // Update order status and details
    order.status = status;

    if (status === "cancelled") {
      order.cancellationReason = cancellationReason;
    } else if (status === "dispatched") {
      order.dispatchDetails = {
        dispatchedBy,
        dispatchedAt: new Date(),
        deliveryEstimate,
      };
    }

    await order.save({ session: mongoDB_session });
    await mongoDB_session.commitTransaction();
    mongoDB_session.endSession();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    await mongoDB_session.abortTransaction();
    mongoDB_session.endSession();

    console.error("Transaction Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

export const getOrderAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const orders = await Order.aggregate([
      {
        $match: {
          status: "successful",
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $count: {} },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: orders[0] || { totalSales: 0, totalOrders: 0 },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching analytics", error });
  }
};

// write order status update function
export const order_states = [
  "Pending",
  "Completed",
  "Dispatched",
  "Shipped",
  "Delivered",
  "Cancelled",
];
