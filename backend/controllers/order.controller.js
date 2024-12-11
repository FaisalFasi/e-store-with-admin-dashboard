import Order from "../models/order.model.js";
import {
  startOfDay,
  subDays,
  startOfWeek,
  startOfMonth,
  subMonths,
  startOfYear,
  subYears,
} from "date-fns";

export const getOrders = async (req, res) => {
  try {
    const { filterBy, startDate, endDate } = req.query;

    let filter = {};
    const now = new Date();

    switch (filterBy) {
      case "today":
        filter.createdAt = { $gte: startOfDay(now) };
        break;
      case "yesterday":
        filter.createdAt = {
          $gte: subDays(startOfDay(now), 1),
          $lte: startOfDay(now),
        };
        break;
      case "this_week":
        filter.createdAt = { $gte: startOfWeek(now) };
        break;
      case "this_month":
        filter.createdAt = { $gte: startOfMonth(now) };
        break;
      case "previous_month":
        filter.createdAt = {
          $gte: startOfMonth(subMonths(now, 1)),
          $lte: startOfMonth(now),
        };
        break;
      case "this_year":
        filter.createdAt = { $gte: startOfYear(now) };
        break;
      case "previous_year":
        filter.createdAt = {
          $gte: startOfYear(subYears(now, 1)),
          $lte: startOfYear(now),
        };
        break;
      default:
        console.log("No filter selected, fetching all orders.");
        break;
    }

    // Support custom date range filtering
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(filter)
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: orders || [],
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  console.log("Order id in order controller", orderId);
  try {
    // here we are using user because we have populated the user field in the order model
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    console.log("Order in order controller", order);
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

export const orderStatusUpdate = async (req, res) => {
  const { orderId } = req.params;
  const { status, cancellationReason, dispatchedBy, deliveryEstimate } =
    req.body;
  console.log("Order id in order controller", orderId);

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
