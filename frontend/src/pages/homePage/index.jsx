import React, { useState } from "react";
import { useEffect } from "react";
import FeaturedProducts from "../../components/products/FeaturedProducts/FeaturedProducts";
import { motion } from "framer-motion";
// import { categories } from "../../utils/homeCategories/categories.js";
import CategoryItem from "../../components/products/CategoryItem/CategoryItem";
import { useCategoryData } from "../../hooks/useCategoryData";
import { useCategoryStore } from "../../stores/useCategoryStore";
import { useUserStore } from "../../stores/useUserStore";
import { useProductStoreData } from "../../hooks/useProductStoreData.js";
import ProductCard from "../../components/products/ProductCard/ProductCard.jsx";
import { useProductStore } from "../../stores/useProductStore.js";
import ProductCarousel from "@/components/products/ProductCarousel/ProductCarousel";
import LoadingSpinner from "@/components/shared/LoadingSpinner/LoadingSpinner";

const HomePage = () => {
  const {
    fetchAllProducts,
    products,
    featuredProducts,
    fetchFeaturedProducts,
    isLoading,
    currentPage,
    productsPerPage,
    setCurrentPage,
  } = useProductStore();
  // const { getAllCategories } = useCategoryData();
  const { getAllCategories } = useCategoryStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.role === "admin") getAllCategories();
  }, [user]);

  useEffect(() => {
    fetchAllProducts();
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4"
        >
          Explore Our Categories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-xl text-gray-300 mb-12"
        >
          Discover the latest trends in eco-friendly fashion
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.isArray(products) &&
            products.map((product, index) => {
              return (
                <ProductCard
                  product={product}
                  key={product._id}
                  index={index}
                />
              );
            })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))} */}
        </div>
        {isLoading && featuredProducts.length > 0 ? (
          <LoadingSpinner />
        ) : (
          <div>
            {featuredProducts.length > 0 && (
              <ProductCarousel
                products={featuredProducts}
                title={"Featured Products"}
                titleColor="emerald"
              />
            )}
          </div>
        )}

        {/* {!isLoading && featuredProducts.length > 0 && (
          <FeaturedProducts featuredProducts={featuredProducts} />
        )} */}
      </div>
    </div>
  );
};

export default HomePage;
