import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  checkingAuth: false,
  // functions to be used in components
  loginAsGuest: async () => {
    try {
      set({ loading: true });
      const { data } = await axiosBaseURL.post("/auth/guest-login"); // Adjust endpoint if needed
      console.log("data in guest login:", data);
      set({ user: data.guestUser });
      toast.success("Logged in as Guest!");
    } catch (error) {
      console.error("Error logging in as guest:", error);
      toast.error("Failed to log in as guest.");
    } finally {
      set({ loading: false });
    }
  },

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
      return response?.data;
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
      const response = await axiosBaseURL.post("/auth/login", {
        email,
        password,
        captcha,
      });

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
  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });

    try {
      const response = await axiosBaseURL.post(
        "/auth/refresh-token",
        {},
        {
          withCredentials: true,
        }
      );

      const { accessToken } = response?.data || {};

      if (accessToken) {
        axiosBaseURL.defaults.headers.Authorization = `Bearer ${accessToken}`;
        set({ checkingAuth: false });
        return accessToken;
      }
    } catch (error) {
      console.log("Silent token refresh failure", error);
      // No toast here - just clean up and logout
      set({ checkingAuth: false, user: null });
      localStorage.removeItem("user");
      throw error; // Still throw for the interceptor
    }
  },
}));

// implement interceptor to check if the user is authenticated

// Improved token refresh mechanism with timeout and better error handling
let refreshingPromise = null;
let refreshTimeout = null;

// Intercept the response and check if the token is expired and refresh the token
// if the access token is expired and the refresh token is also expired then logout the user
axiosBaseURL.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to an expired token and we're not already trying to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        // Clear any existing refresh timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }

        // Create a refresh token attempt or use existing one
        if (!refreshingPromise) {
          refreshingPromise = useUserStore.getState().refreshToken();

          // Set a timeout to clear the refreshingPromise in case it hangs
          refreshTimeout = setTimeout(() => {
            if (refreshingPromise) {
              console.warn("Token refresh timed out");
              refreshingPromise = null;
              useUserStore.getState().logout();
            }
          }, 10000); // 10 second timeout

          await refreshingPromise;
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
          refreshingPromise = null;
        } else {
          await refreshingPromise; // Wait for existing refresh
        }

        // Retry the original request with updated headers
        originalRequest.headers.Authorization =
          axiosBaseURL.defaults.headers.Authorization;

        return axiosBaseURL(originalRequest);
      } catch (refreshError) {
        // Clear state
        refreshingPromise = null;
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }

        // Force logout
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // For network errors (no response), add a custom message
    if (!error.response) {
      error.customMessage = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);
