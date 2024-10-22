import { create } from "zustand";

import toast from "react-hot-toast";
import axiosBaseURL from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  loading: false,

  createProduct: async (productData) => {
    try {
      set({ loading: true });

      const response = await axiosBaseURL.post("/products", productData);

      // here we are using the prevState to update the products array and add the new product to it without mutating the state directly using the spread operator to copy the previous state and then add the new product to it using the response.data which is the new product that was created in the backend and returned to us as a response from the server after creating the product in the database and then we set the loading to false
      set((prevState) => ({
        products: [...prevState.products, response.data],
        loading: false,
      }));
      toast.success("Product created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "Failed to create product");
    }
  },

  fetchProducts: async () => {
    try {
      const response = await axiosBaseURL.get("/products");
      set({ products: response.data });
    } catch (error) {
      toast.error("Failed to fetch products");
      toast.error(error.response.data.error || "Failed to fetch product");
    }
  },
}));
