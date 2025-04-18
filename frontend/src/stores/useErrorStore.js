// 1. Create error store (stores/errorStore.js)
import { create } from "zustand";
import toast from "react-hot-toast";

export const useErrorStore = create(() => ({
  handleError: (error, options = {}) => {
    const {
      defaultMessage = "Something went wrong",
      showToast = true,
      toastDuration = 4000,
    } = options;

    // Extract error message
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.response?.data?.message || error?.message || defaultMessage;

    // Log to console
    console.error("Error:", error);

    // Show toast if enabled
    if (showToast) {
      toast.error(errorMessage, {
        duration: toastDuration,
        position: "top-center",
      });
    }

    return errorMessage;
  },
}));
