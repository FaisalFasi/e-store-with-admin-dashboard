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
      console.log("productData:", productData);
      if (!productData.image) {
        set({ loading: false });
        return toast.error("Please select an image");
      }
      const response = await axiosBaseURL.post("/products", productData);
      console.log("response:", response);

      // here we are using the prevState to update the products array and add the new product to it without mutating the state directly using the spread operator to copy the previous state and then add the new product to it using the response.data which is the new product that was created in the backend and returned to us as a response from the server after creating the product in the database and then we set the loading to false
      set((prevState) => ({
        products: [...prevState.products, response.data],
        loading: false,
      }));
      toast.success("Product created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data.error || "Failed to create product");
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.get("/products");
      set({ products: response?.data?.products, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data.error || "Failed to fetch product");
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axiosBaseURL.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter(
          (product) => product._id !== productId
        ),
        loading: false,
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data.error || "Failed to delete product");
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.patch(`/products/${productId}`);
      const updatedProduct = response?.data?.updatedProduct;

      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: updatedProduct.isFeatured }
            : product
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data.error || "Failed to update product");
    }
  },
}));
