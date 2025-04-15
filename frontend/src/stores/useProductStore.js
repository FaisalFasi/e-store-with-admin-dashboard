import { create } from "zustand";
import toast from "react-hot-toast";
import axiosBaseURL from "../lib/axios";
import { isCacheValidForFetchingProducts } from "../helpers/cacheHelper";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      featuredProducts: [],
      recommendedProducts: [],
      loading: false,
      error: null,
      cacheTimestamp: null,
      currentPage: 1,
      productsPerPage: 20,

      // Actions
      setProducts: (products) => set({ products }),
      setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),

      createProduct: async (formData) => {
        const formDataObject = Object.fromEntries(formData.entries());
        console.log("Form data in createProduct:", formDataObject);

        try {
          set({ loading: true });
          const response = await axiosBaseURL.post("/products", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          set((prevState) => ({
            products: [...prevState.products, response.data.product],
            loading: false,
          }));
          toast.success("Product created successfully");
          return response?.data;
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to create product",
          });
          toast.error(
            error?.response?.data.error || "Failed to create product"
          );
        }
      },

      // Check cache first if not forcing refetch
      // if (!forceRefetch && isCacheValidForFetchingProducts(get)) {
      //   return;
      // }
      fetchAllProducts: async (forceRefetch = false) => {
        set({ loading: true, error: null });

        try {
          const response = await axiosBaseURL.get("/products", {
            params: {
              limit: get().productsPerPage,
              page: get().currentPage,
            },
          });

          if (response.data.products) {
            set({
              products: response.data.products,
              // cacheTimestamp: Date.now(),
              loading: false,
            });
          } else {
            set({ products: [], loading: false });
            toast.error("Failed to fetch products");
          }
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to fetch products",
          });
          console.error("Error fetching products:", error);
        }
      },

      setCurrentPage: (page) => set({ currentPage: page }),

      fetchProductById: async (productId) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosBaseURL.get(`/products/${productId}`);
          set({ products: response?.data?.product, loading: false });
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to fetch product",
          });
          console.error("Error fetching product:", error);
        }
      },

      fetchProductsByCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosBaseURL.get(
            `/products/category/${category}`
          );
          set({ products: response?.data?.products, loading: false });
        } catch (error) {
          set({
            loading: false,
            error:
              error?.response?.data?.error ||
              "Failed to fetch products by category",
          });
        }
      },

      deleteProduct: async (productId) => {
        set({ loading: true, error: null });
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
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to delete product",
          });
        }
      },

      toggleFeaturedProduct: async (productId) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosBaseURL.patch(
            `/products/toggleFeature/${productId}`
          );
          const updatedProduct = response?.data?.product;
          set((prevState) => ({
            products: prevState.products.map((product) =>
              product._id === productId
                ? { ...product, isFeatured: updatedProduct.isFeatured }
                : product
            ),
            loading: false,
          }));
          toast.success(`${updatedProduct?.name} successfully updated`);
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to update product",
          });
        }
      },

      fetchFeaturedProducts: async (forceRefetch = false) => {
        if (!forceRefetch && get().featuredProducts.length > 0) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const response = await axiosBaseURL.get("/products/featured");

          if (!response.data?.products) {
            set({ featuredProducts: [], loading: false });
            return toast.error("No featured products found");
          }

          set({
            featuredProducts: response.data.products,
            loading: false,
            // cacheTimestamp: Date.now(),
          });
        } catch (error) {
          set({
            loading: false,
            error: "Failed to fetch featured products",
          });
        }
      },

      fetchRecommendedProducts: async (productId) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosBaseURL.get(
            "/products/recommended/" + productId
          );

          if (!response.data?.products) {
            set({ recommendedProducts: [], loading: false });
            return toast.error("No recommendations found");
          }

          set({
            recommendedProducts: response.data.products,
            loading: false,
          });
        } catch (error) {
          set({
            loading: false,
            error: "Failed to fetch recommendations",
          });
        }
      },
    }),
    {
      name: "product-store", // unique name for localStorage key
      partialize: (state) => ({
        products: state.products,
        featuredProducts: state.featuredProducts,
        recommendedProducts: state.recommendedProducts,
        // cacheTimestamp: state.cacheTimestamp,
      }), // only persist these fields
      getStorage: () => localStorage, // or sessionStorage for session-only persistence
    }
  )
);
