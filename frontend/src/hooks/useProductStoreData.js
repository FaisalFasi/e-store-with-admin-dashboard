import { useProductStore } from "../stores/useProductStore";

export const useProductStoreData = () => {
  const {
    products,
    fetchAllProducts,
    fetchProductById,
    fetchProductsByCategory,
    createProduct,
    deleteProduct,
    toggleFeaturedProduct,
    setCurrentPage,
    productsPerPage,
    loading,
  } = useProductStore();

  return {
    products,
    fetchAllProducts,
    fetchProductById,
    fetchProductsByCategory,
    createProduct,
    deleteProduct,
    toggleFeaturedProduct,
    setCurrentPage,
    productsPerPage,
    loading,
  };
};
