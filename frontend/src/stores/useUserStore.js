import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  checkingAuth: false,
  // functions to be used in components
  signUp: async ({ name, email, password, confirmPassword, captcha }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const response = await axiosBaseURL.post("/auth/signup", {
        email,
        name,
        password,
        captcha,
      });
      if (!response) {
        return toast.error("Account creation failed");
      } else {
        toast.success("Account created successfully");
      }

      set({ user: response?.data?.user, loading: false });
    } catch (error) {
      set({ loading: false });
      if (error?.response && error?.response?.status === 429) {
        toast.error(
          error?.response?.data || "Too many attempts. Please try again later."
        );
      } else {
        toast.error(
          error.response.data.message ||
            "An error occurred in sign up function in user store"
        );
      }
    }
  },
  login: async (email, password, captcha) => {
    set({ loading: true });
    try {
      console.log("captcha before", captcha);
      const response = await axiosBaseURL.post("/auth/login", {
        email,
        password,
        captcha,
      });
      console.log("captcha after", captcha);

      // here set the user to the response data. so set will return the user data like {user: response data, loading : false}
      // and we can access the user data in the component where we are using this store
      set({ user: response?.data?.user, loading: false });
      localStorage.setItem("user", JSON.stringify(get().user)); // Store user after setting it
    } catch (error) {
      set({ loading: false });
      console.log("error :", error.message);
      console.log("error.response :", error.response);
      if (error.response && error.response.status === 429) {
        toast.error(
          error?.response?.data || "Too many attempts. Please try again later."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "An error occurred in login function in user store"
        );
        console.log("error :", error.message);
      }
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true, loading: true });

    try {
      const response = await axiosBaseURL.get("/auth/profile");
      set({ user: response?.data?.user, checkingAuth: false, loading: false });
      localStorage.setItem("user", JSON.stringify(get().user)); // Store user after setting it
    } catch (error) {
      set({ checkingAuth: false, user: null, loading: false });
      localStorage.removeItem("user"); // Remove user from localStorage on failure

      console.log("error :", error.message);
      toast.error("An error occurred in checkAuth function in user store");
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await axiosBaseURL.get("/auth/logout");
      set({ user: null, loading: false });
      localStorage.removeItem("user"); // Clear user data from localStorage
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message ||
          "An error occurred in logout function in user store"
      );
    }
  },
  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true, loading: true });
    try {
      const response = await axiosBaseURL.post("/auth/refresh-token");
      set({ checkingAuth: false, loading: false });
      // here response doesn't matter because we are just refreshing the token and not setting the user data
      return response?.data;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message ||
          "An error occurred in refreshToken function in user store"
      );
    }
  },

  //  function to request reset password
  requestResetPassword: async (email) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.post(
        "/auth/request-forgot-password",
        {
          email: email,
        }
      );
      console.log("response:", response);

      toast.success(response?.data?.message || "Password reset successfully");

      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message ||
          "An error occurred in resetPassword function in user store"
      );
    }
  },
}));

// implement interceptor to check if the user is authenticated
// axios interceptor for token refresh
let refreshingPromise = null;

axiosBaseURL.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (refreshingPromise) {
          await refreshingPromise;
          return axiosBaseURL(originalRequest);
        }

        refreshingPromise = useUserStore.getState().refreshToken();
        await refreshingPromise;
        refreshingPromise = null;

        return axiosBaseURL(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
