import React, { useEffect } from "react";
import { useProductStore } from "../../stores/useProductStore";

const CategoryPage = () => {
  const { fetchProductsByCategory, products } = useProductStore();

  useEffect(() => {
    fetchProductsByCategory("shoes");
  }, [fetchProductsByCategory]);
  console.log(products);
  return <div>CategoryPage</div>;
};

export default CategoryPage;
