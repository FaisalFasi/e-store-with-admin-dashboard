import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosBaseURL from "../lib/axios";

export const useNewsLetterStore = create((set, get) => ({
  loading: false,
  message: "",

  // functions to be used in components
  subscribeToNewsletter: async (email) => {
    set({ loading: true });
    console.log("Subscribing email:", email);
    try {
      const response = await axiosBaseURL.post("/newsletter/subscribe", {
        email,
      });
      console.log("response:", response);

      set({ loading: false, message: response?.data?.message });
      toast.success(response?.data?.message || "Thank you for subscribing!");
      return { success: true, message: response?.data?.message };
    } catch (error) {
      set({ loading: false });
      if (error?.response && error?.response?.status === 429) {
        toast.error(
          error?.response?.data || "Too many attempts. Please try again later."
        );
      } else {
        toast.error(
          error.response.data.message || "Error in subscribing to newsletter"
        );
        return { success: false, message: error.response.data.message };
      }
    }
  },
}));
