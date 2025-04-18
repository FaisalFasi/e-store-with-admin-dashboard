import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  // Setter functions
  setCategories: (categories) => set({ categories, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  getAllCategories: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axiosBaseURL.get("/category");

      set({
        categories: response?.data || response?.data?.categories || [],
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error,
      });
      toast.error(error?.response?.data?.error || "Failed to fetch categories");
      console.log("Error getting categories", error.message);
    }
  },

  getParentCategories: async () => {
    const currentCategories = get().categories;

    // If we already have categories and want to filter parents
    // (assuming parent categories can be filtered from existing data)
    if (currentCategories?.length > 0) {
      const parentCategories = currentCategories?.filter(
        (cat) => !cat.parentId
      );
      if (parentCategories.length > 0) {
        return parentCategories;
      }
    }
    try {
      set({ loading: true, error: null });
      const response = await axiosBaseURL.get("/category/parent-categories");

      set({
        loading: false,
        categories: [...get().categories, ...response?.data], // Merge with existing
      });
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error?.response?.data?.error || "Failed to fetch parent categories"
      );
      console.log("Error getting categories", error.message);
    }
  },

  createCategory: async (category) => {
    console.log("Category to create ", category);
    try {
      set({ loading: true, error: null });

      const response = await axiosBaseURL.post(
        "/category/create-category",
        category,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Create category endpoint ", response.data);

      // Assuming the response contains the created category object
      set((state) => ({
        categories: [response.data, ...state.categories],
        loading: false,
      }));
      return response?.data;
    } catch (error) {
      set({ loading: false });
      console.log("Error creating category", error.message);
    }
  },

  updateCategory: async (category) => {
    set({ loading: true });
    try {
      console.log("Category to update ", category);

      const response = await axiosBaseURL.put(
        `/category/${category._id}`,
        category
      );
      console.log("Update category endpoint ", response.data);

      set((state) => ({
        categories: state.categories.map((c) =>
          c._id === category._id ? response.data : c
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      console.log("Error updating category", error.message);
    }
  },

  deleteCategory: async (categoryId) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.delete(`/category/${categoryId}`);
      console.log("Delete category endpoint ", response.data);

      set((state) => ({
        categories: state.categories.filter((c) => c._id !== categoryId),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      console.log("Error deleting category", error.message);
    }
  },
}));
