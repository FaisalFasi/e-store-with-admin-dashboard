import { create } from "zustand";
import toast from "react-hot-toast";
import axiosBaseURL from "../lib/axios";
import { cacheChecking } from "../helpers/cacheHelper";

export const useProductStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  recommendedProducts: [],
  loading: false,
  cacheTimestamp: null,
  currentPage: 1,
  productsPerPage: 20,

  setProducts: (products) => set({ products }),
  setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),

  createProduct: async (formData) => {
    // how i can get value from FormData by entries ?
    // i said get not append here is formData

    const formDataObject = Object.fromEntries(formData.entries());
    console.log("Form data in createProduct:", formDataObject);

    try {
      set({ loading: true });

      const response = await axiosBaseURL.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response from createProduct:", response);

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

      if (response.data.products) {
        set({
          products: response.data.products,
          cacheTimestamp: Date.now(),
          loading: false,
        });
      } else {
        toast.error("Failed to fetch products");
        set({ products: [], loading: false });
      }
    } catch (error) {
      set({ loading: false, products: [] });
      console.log("Error fetching products:", error);
      toast.error(error?.response?.data.error || "Failed to fetch product");
    }
  },
  setCurrentPage: (page) => set({ currentPage: page }),

  fetchProductById: async (productId) => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.get(`/products/${productId}`);

      set({ products: response?.data?.product, loading: false });
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
      const response = await axiosBaseURL.patch(
        `/products/toggleFeature/${productId}`
      );
      const updatedProduct = response?.data?.product;
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: updatedProduct.isFeatured }
            : product
        ),
        loading: false,
      }));
      toast.success(`${response?.data?.product?.name} successfully updated `);
    } catch (error) {
      set({ loading: false });
      console.log("Error in toggle product:", error);
      toast.error(error?.response?.data.error || "Failed to update product");
    }
  },
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.get("/products/featured");
      console.log("Full API response:", response); // Add this to see the actual response structure

      // Check if data exists and has the expected structure
      if (!response.data || !response.data.products) {
        set({
          featuredProducts: [],
          loading: false,
        });
        return toast.error("No featured products found");
      }

      set({ featuredProducts: response.data.products, loading: false });
    } catch (error) {
      console.error("Full error details:", error); // More detailed error logging
      toast.error("Failed to fetch featured products");
      set({ error: "Failed to fetch featured products", loading: false });
    }
  },
  fetchRecommendedProducts: async (productId) => {
    set({ loading: true });
    try {
      console.log("/products/recommended/" + productId); // Add this to see the actual response structure

      const response = await axiosBaseURL.get(
        "/products/recommended/" + productId
      );
      console.log("Full API response:", response); // Add this to see the actual response structure
      // Check if data exists and has the expected structure
      if (!response.data || !response.data.products) {
        set({
          featuredProducts: [],
          loading: false,
        });
        return toast.error("No featured products found");
      }
      set({ recommendedProducts: response.data.products, loading: false });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to load recommendations");
      set({
        error: "Failed to fetch recommendations",
        loading: false,
      });
    }
  },
}));
