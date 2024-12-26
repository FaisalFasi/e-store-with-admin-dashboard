import { create } from "zustand";
import axiosBaseURL from "../lib/axios";

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  setLoading: (loading) => set({ loading }),

  setCategories: (categories) => set({ categories }),

  getAllCategories: async () => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.get("/category");
      console.log("Categories get endpoint ", response.data);

      set({ categories: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.log("Error getting categories", error.message);
    }
  },

  createCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axiosBaseURL.post(
        "/category/create-category",
        category
      );
      console.log("Create category endpoint ", response.data);

      // Assuming the response contains the created category object
      set((state) => ({
        categories: [response.data, ...state.categories],
        loading: false,
      }));
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
