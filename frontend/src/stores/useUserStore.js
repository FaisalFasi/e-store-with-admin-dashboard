import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  // functions to be used in components
  signUp: async ({ name, email, password, confirmPassword }) => {
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
      });

      set({ user: response.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.message ||
          "An error occurred in sign up function in user store"
      );
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    console.log("--------- login ---------");
    console.log(email + " " + password);
    try {
      const response = await axiosBaseURL.post("/auth/login", {
        email,
        password,
      });
      console.log(response.data.user);
      // here set the user to the response data. so set will return the user data like {user: response data, loading : false}
      // and we can access the user data in the component where we are using this store
      set({ user: response.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.message ||
          "An error occurred in login function in user store"
      );
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      console.log("--------- checkAuth ---------");
      const response = await axiosBaseURL.get("/auth/profile");
      console.log("response :", response);
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
      //   console.log("error :", error);
      //   toast.error(
      //     error.response.data.message ||
      //       "An error occurred in checkAuth function in user store"
      //   );
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await axiosBaseURL.get("/auth/logout");
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message ||
          "An error occurred in logout function in user store"
      );
    }
  },
}));
