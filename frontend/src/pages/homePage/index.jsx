import React from "react";
import { useEffect } from "react";
import CategoryItem from "../../components/CategoryItem/CategoryItem";
import { useProductStore } from "../../stores/useProductStore";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
import { motion } from "framer-motion";
import { categories } from "../../utils/homeCategories/categories.js";

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {!isLoading && products.length > 0 && (
          <FeaturedProducts featuredProducts={products} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
