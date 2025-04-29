import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // Setter functions
  setCategories: (categories) => set({ categories, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Get all categories
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

  // Get categories by depth level
  getCategoriesByDepth: (depth) => {
    const categories = get().categories;
    return categories.filter((cat) => cat.depth === depth);
  },

  // Get child categories for a specific parent
  getChildCategories: (parentId) => {
    const categories = get().categories;
    return categories.filter((cat) => cat.parentCategory === parentId);
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      set({ loading: true, error: null });

      const response = await axiosBaseURL.post(
        "/category/create-category",
        categoryData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Add the new category to the state
      set((state) => ({
        categories: [response.data, ...state.categories],
        loading: false,
      }));

      toast.success("Category created successfully");
      return response?.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.error || "Failed to create category");
      console.log("Error creating category", error.message);
    }
  },

  // Update an existing category
  updateCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.put(
        `/category/${category._id}`,
        category
      );

      set((state) => ({
        categories: state.categories.map((c) =>
          c._id === category._id ? response.data : c
        ),
        loading: false,
      }));

      toast.success("Category updated successfully");
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.error || "Failed to update category");
      console.log("Error updating category", error.message);
    }
  },

  // Delete a category
  deleteCategory: async (categoryId) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.delete(`/category/${categoryId}`);

      set((state) => ({
        categories: state.categories.filter((c) => c._id !== categoryId),
        loading: false,
      }));

      toast.success("Category deleted successfully");
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.error || "Failed to delete category");
      console.log("Error deleting category", error.message);
    }
  },
}));
