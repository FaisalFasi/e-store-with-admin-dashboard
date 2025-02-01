import { useCategoryStore } from "../stores/useCategoryStore";

export const useCategoryData = () => {
  const { parentCategories, subCategories, categories, getAllCategories } =
    useCategoryStore();

  return { parentCategories, subCategories, categories, getAllCategories };
};
