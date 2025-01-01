import { create } from "zustand";
import toast from "react-hot-toast";
import axiosBaseURL from "../lib/axios";
import { cacheChecking } from "../helpers/cacheHelper";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  cacheTimestamp: null,

  setProducts: (products) => set({ products }),

  createProduct: async (formData) => {
    try {
      set({ loading: true });

      const response = await axiosBaseURL.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // here we are using the prevState to update the products array and add the new product to it without mutating the state directly using the spread operator to copy the previous state and then add the new product to it using the response.data which is the new product that was created in the backend and returned to us as a response from the server after creating the product in the database and then we set the loading to false
      set((prevState) => ({
        products: [...prevState.products, response.data.product],
        loading: false,
      }));
      toast.success("Product created successfully");
      return response?.data;
    } catch (error) {
      set({ loading: false });
      console.log("Error creating product:", error);
      toast.error(error?.response?.data.error || "Failed to create product");
    }
  },

  fetchAllProducts: async (forceRefetch = false) => {
    // if (cacheChecking(get, forceRefetch)) return;

    set({ loading: true });

    try {
      const response = await axiosBaseURL.get("/products");
      set({
        products: response?.data?.products,
        cacheTimestamp: Date.now(),
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data.error || "Failed to fetch product");
    }
  },
  fetchProductById: async (productId) => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.get(`/products/${productId}`);

      set({ products: response.data.product, loading: false });
    } catch (error) {
      set({ loading: false });
      console.log("Error fetching product:", error);
      toast.error(error?.response?.data.error || "Failed to fetch product");
    }
  },

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
      if (response?.data?.products?.length === 0) {
        set({ error: "No featured products found", loading: false });
        return;
      }
      set({ products: response?.data?.products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
}));
