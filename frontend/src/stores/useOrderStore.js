import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosBaseURL from "../lib/axios";

export const ORDER_STATUSES = [
  "Pending",
  "Dispatched",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Failed",
];

export const useOrderStore = create((set, get) => ({
  loading: false,
  orders: [],
  singleOrder: {},

  getOrders: async () => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.get("/orders");
      console.log("Orders:", response?.data?.orders);
      set({
        orders: response?.data?.orders,
        loading: false,
      });
    } catch (error) {
      set({ orders: [], loading: false });
      console.error("Error in getOrders:", error);
      toast.error(error?.message || "Error in getOrders");
    }
  },
  getOrderById: async (orderId) => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.get(`/orders/${orderId}`);
      console.log("Order:", response?.data?.order);
      set({
        singleOrder: response?.data?.order,
        loading: false,
      });
    } catch (error) {
      set({ singleOrder: {}, loading: false });
      console.error("Error in getOrderByID:", error);
      toast.error(error?.message || "Error in getOrderByID");
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.put(`/orders/${orderId}/status`, {
        status,
      });
      console.log("Order status updated:", response?.data?.order);
      set({ loading: false });
      toast.success("Order status updated successfully");
    } catch (error) {
      set({ loading: false });
      console.error("Error in updateOrderStatus:", error);
      toast.error(error?.message || "Error in updateOrderStatus");
    }
  },
  sendOrderUpdateEmail: async (email, newStatus) => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.put(
        `/api/orders/send-order-status-email`,
        {
          email,
          status: newStatus,
        }
      );
      console.log("Order update email sent:", response?.data?.message);
      set({ loading: false });
      toast.success("Order update email sent successfully");
    } catch (error) {
      set({ loading: false });
      console.error("Error in sendOrderUpdateEmail:", error);
      toast.error(error?.message || "Error in sendOrderUpdateEmail");
    }
  },
}));
