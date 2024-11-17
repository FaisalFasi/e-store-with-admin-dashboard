import { create } from "zustand";

import toast from "react-hot-toast";
import axiosBaseURL from "../lib/axios";
import { useSWR_ } from "../lib/hooks/useSWR_";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  loading: false,

  createProduct: async (productData) => {
    try {
      set({ loading: true });
      if (!productData.image) {
        set({ loading: false });
        return toast.error("Please select an image");
      }
      const response = await axiosBaseURL.post("/products", productData);

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

  // Fetch all products using SWR
  fetchAllProducts: () => {
    const { data, error, isLoading } = useSWR_("/products"); // Using the custom SWR hook

    set({
      products: data ? data.products : [],
      loading: isLoading, // Set loading to true if data is still being fetched
    });
    if (error) {
      toast.error(error?.response?.data.error || "Failed to fetch product");
      console.log("Error fetching products:", error ? error : "No error");
    }
  },

  // fetchAllProducts: async () => {
  //   set({ loading: true });

  //   try {
  //     const response = await axiosBaseURL.get("/products");
  //     set({ products: response?.data?.products, loading: false });
  //   } catch (error) {
  //     set({ loading: false });
  //     toast.error(error?.response?.data.error || "Failed to fetch product");
  //   }
  // },
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.get(`/products/category/${category}`);
      set({ products: response?.data?.products, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error?.response?.data.error || "Failed to fetch products by category"
      );
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
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.get("/products/featured");
      console.log("Featured products response:", response);
      set({ products: response?.data?.products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
}));
