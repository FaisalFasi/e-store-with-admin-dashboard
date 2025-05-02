import { create } from "zustand";
import toast from "react-hot-toast";
import axiosBaseURL from "../lib/axios";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      product: null,
      loading: false,
      error: null,

      featuredProducts: [],
      recommendedProducts: [],
      relatedProducts: [],
      cacheTimestamp: null,

      // Pagination
      currentPage: 1,
      productsPerPage: 20,
      totalProducts: 0,

      // Search and filtering
      filteredProducts: [],
      searchTerm: "",
      minPrice: 0,
      maxPrice: 1000,
      activeFilters: {
        minPrice: null,
        maxPrice: null,
        categories: [],
        sortBy: "featured",
      },

      // Actions
      setLoading: (loading) => set({ loading }),
      clearProduct: () => set({ product: null }),
      setProducts: (products) => set({ products }),
      setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),

      initializeSearchAndFilters: () => {
        // Check if we have a saved search term when initializing the store
        if (typeof window !== "undefined") {
          const savedSearchTerm = sessionStorage.getItem("searchTerm");
          if (savedSearchTerm) {
            get().searchProducts(savedSearchTerm);
          }
        }
      },

      createProduct: async (formData) => {
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
            // Calculate min and max price from all products
            if (response.data.products.length > 0) {
              const prices = response.data.products.map(
                (product) => product.price
              );
              const minPrice = Math.floor(Math.min(...prices));
              const maxPrice = Math.ceil(Math.max(...prices));
              set({ minPrice, maxPrice });
            }

            const allProducts = response.data.products;

            // Create filtered products using current search term and filters
            const { searchTerm, activeFilters } = get();
            const filtered =
              searchTerm ||
              (activeFilters &&
                Object.keys(activeFilters).some((key) =>
                  Array.isArray(activeFilters[key])
                    ? activeFilters[key].length > 0
                    : activeFilters[key] !== null
                ))
                ? filterProducts(allProducts, searchTerm, activeFilters)
                : allProducts;

            set({
              products: allProducts,
              filteredProducts: filtered,
              totalProducts: response.data.totalProducts || allProducts.length,
              loading: false,
            });

            // Initialize search and filters after loading products
            get().initializeSearchAndFilters();
          } else {
            set({ products: [], filteredProducts: [], loading: false });
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

      setCurrentPage: (page) => {
        set({ currentPage: page });
        // If using server-side pagination, refetch products when page changes
        if (get().products.length > 0) {
          get().fetchAllProducts();
        }
      },

      fetchProductById: async (productId) => {
        set({ loading: true, error: null });
        try {
          // First check if the product is already in the store
          const cachedProduct = get().products.find((p) => p._id === productId);

          if (cachedProduct) {
            set({
              product: cachedProduct,
              loading: false,
              error: null,
            });
            return cachedProduct;
          }

          // If not found in store, fetch from API
          const response = await axiosBaseURL.get(`/products/${productId}`);

          set({
            product: response?.data?.product,
            loading: false,
            error: null,
          });

          return response?.data?.product;
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to fetch product",
          });
          console.error("Error fetching product:", error);
          throw error;
        }
      },

      getProductById: async (productId) => {
        return get().fetchProductById(productId);
      },

      fetchProductsByCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosBaseURL.get(
            `/products/category/${category}`
          );
          set({
            products: response?.data?.products,
            filteredProducts: response?.data?.products,
            loading: false,
          });
          return response?.data?.products;
        } catch (error) {
          set({
            loading: false,
            error:
              error?.response?.data?.error ||
              "Failed to fetch products by category",
          });
          throw error;
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
            filteredProducts: prevState.filteredProducts.filter(
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
          });

          return response.data.products;
        } catch (error) {
          set({
            loading: false,
            error: "Failed to fetch featured products",
          });
          throw error;
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

          return response.data.products;
        } catch (error) {
          set({
            loading: false,
            error: "Failed to fetch recommendations",
          });
          throw error;
        }
      },

      // Get related products (from same category)
      getRelatedProducts: async (categoryId, currentProductId, limit = 8) => {
        try {
          // First try to get products from the same category
          const { products } = get();

          // Filter products by category and exclude current product
          let related = products.filter(
            (p) => p.category === categoryId && p._id !== currentProductId
          );

          // If we don't have enough related products in the store, fetch from API
          if (related.length < limit) {
            try {
              set({ loading: true });
              const response = await axiosBaseURL.get(
                `/products/category/${categoryId}`
              );

              if (response.data?.products) {
                // Filter out the current product
                related = response.data.products.filter(
                  (p) => p._id !== currentProductId
                );
              }
            } catch (error) {
              console.error("Error fetching related products:", error);
            } finally {
              set({ loading: false });
            }
          }

          // If still not enough, get some random products
          if (related.length < limit) {
            const otherProducts = products
              .filter(
                (p) =>
                  p._id !== currentProductId &&
                  !related.some((r) => r._id === p._id)
              )
              .sort(() => 0.5 - Math.random())
              .slice(0, limit - related.length);

            related = [...related, ...otherProducts];
          }

          // Limit to requested number and set in store
          const limitedRelated = related.slice(0, limit);
          set({ relatedProducts: limitedRelated });

          return limitedRelated;
        } catch (error) {
          console.error("Error getting related products:", error);
          return [];
        }
      },

      // Search products
      searchProducts: (term) => {
        // Persist search term in the store state
        set({ searchTerm: term });
        const { products, activeFilters } = get();

        // If search term is empty, reset to all products but keep other filters
        if (!term) {
          const filtered = filterProducts(products, "", activeFilters);
          set({
            filteredProducts: filtered,
            currentPage: 1,
          });

          // Remove search term from sessionStorage
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("searchTerm");
          }

          return filtered;
        }

        // Apply search term and existing filters
        const filtered = filterProducts(products, term, activeFilters);

        set({
          filteredProducts: filtered,
          currentPage: 1,
        });

        // Store search term in sessionStorage for persistence between page navigations
        if (typeof window !== "undefined") {
          sessionStorage.setItem("searchTerm", term);
        }

        return filtered;
      },

      // Apply filters
      applyFilters: (filters) => {
        const { products, searchTerm } = get();
        set({ activeFilters: filters });

        const filtered = filterProducts(products, searchTerm, filters);

        set({
          filteredProducts: filtered,
          currentPage: 1,
        });

        return filtered;
      },

      // Reset filters
      resetFilters: () => {
        const { products } = get();

        // Clear search term from sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("searchTerm");
        }

        set({
          searchTerm: "",
          activeFilters: {
            minPrice: null,
            maxPrice: null,
            categories: [],
            sortBy: "featured",
          },
          filteredProducts: products,
          currentPage: 1,
        });
      },

      // Add product review
      addProductReview: async (productId, review) => {
        set({ loading: true });
        try {
          const response = await axiosBaseURL.post(
            `/products/${productId}/reviews`,
            review
          );

          // Update product in store
          const { products, product } = get();

          // Update products array
          const updatedProducts = products.map((p) =>
            p._id === productId
              ? {
                  ...p,
                  reviews: [...(p.reviews || []), response.data.review],
                  rating: response.data.updatedRating || p.rating,
                }
              : p
          );

          // Update current product if it's loaded
          let updatedProduct = product;
          if (product && product._id === productId) {
            updatedProduct = {
              ...product,
              reviews: [...(product.reviews || []), response.data.review],
              rating: response.data.updatedRating || product.rating,
            };
          }

          set({
            products: updatedProducts,
            product: updatedProduct,
            loading: false,
          });

          toast.success("Review added successfully");
          return response.data;
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to add review",
          });
          toast.error(error?.response?.data?.error || "Failed to add review");
          throw error;
        }
      },

      // Update product
      updateProduct: async (productId, formData) => {
        set({ loading: true });
        try {
          const response = await axiosBaseURL.put(
            `/products/${productId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const updatedProduct = response.data.product;

          // Update products array
          set((prevState) => ({
            products: prevState.products.map((p) =>
              p._id === productId ? updatedProduct : p
            ),
            filteredProducts: prevState.filteredProducts.map((p) =>
              p._id === productId ? updatedProduct : p
            ),
            // If this is the currently viewed product, update it too
            product:
              prevState.product && prevState.product._id === productId
                ? updatedProduct
                : prevState.product,
            loading: false,
          }));

          toast.success("Product updated successfully");
          return updatedProduct;
        } catch (error) {
          set({
            loading: false,
            error: error?.response?.data?.error || "Failed to update product",
          });
          toast.error(
            error?.response?.data?.error || "Failed to update product"
          );
          throw error;
        }
      },
    }),
    {
      name: "product-store", // unique name for localStorage key
      partialize: (state) => ({
        products: state.products,
        product: state.product,
        featuredProducts: state.featuredProducts,
        recommendedProducts: state.recommendedProducts,
        filteredProducts: state.filteredProducts,
        searchTerm: state.searchTerm,
        activeFilters: state.activeFilters,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
      }), // only persist these fields
      getStorage: () => localStorage, // or sessionStorage for session-only persistence
    }
  )
);

// Update the filterProducts helper function to ensure it works with base currency values
const filterProducts = (products, searchTerm, filters) => {
  let filtered = [...products];

  // Apply search term filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.description &&
          product.description.toLowerCase().includes(term))
    );
  }

  // Apply price filter - ensure we're using base currency values
  if (filters.minPrice !== null) {
    filtered = filtered.filter((product) => product.price >= filters.minPrice);
  }

  if (filters.maxPrice !== null) {
    filtered = filtered.filter((product) => product.price <= filters.maxPrice);
  }

  // Apply category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((product) =>
      filters.categories.includes(product.category)
    );
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "featured":
      default:
        filtered.sort(
          (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        );
        break;
    }
  }

  return filtered;
};
