"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "../../components/products/ProductCard/ProductCard.jsx";
import ProductCarousel from "@/components/products/ProductCarousel/ProductCarousel";
import LoadingSpinner from "@/components/shared/LoadingSpinner/LoadingSpinner";
import ProductFilters from "@/components/products/ProductFilters/ProductFilters";
import { useProductStore } from "../../stores/useProductStore.js";
import { useCategoryStore } from "../../stores/useCategoryStore";
import { useUserStore } from "../../stores/useUserStore";
import Pagination from "@/components/shared/Pagination/Pagination";
import NotFound from "@/components/shared/NotFound/NotFound.jsx";

const HomePage = () => {
  const {
    fetchAllProducts,
    products,
    filteredProducts,
    featuredProducts,
    fetchFeaturedProducts,
    isLoading,
    currentPage,
    productsPerPage,
    searchTerm,
    activeFilters,
  } = useProductStore();

  const { getAllCategories } = useCategoryStore();
  const { user } = useUserStore();

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Display appropriate message for search results
  const displaySearchMessage = () => {
    if (searchTerm && filteredProducts.length > 0) {
      return (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-emerald-400 mb-2">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Product" : "Products"} Found
          </h2>
          <p className="text-gray-300">
            Search results for:{" "}
            <span className="text-emerald-300">"{searchTerm}"</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if filters are active
  const hasActiveFilters =
    searchTerm ||
    activeFilters.categories.length > 0 ||
    activeFilters.minPrice !== null ||
    activeFilters.maxPrice !== null ||
    activeFilters.sortBy !== "featured";

  useEffect(() => {
    if (user?.role === "admin") getAllCategories();
  }, [user]);

  useEffect(() => {
    fetchAllProducts();
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-2"
        >
          Discover Amazing Products
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-lg text-gray-300 mb-8"
        >
          Explore our collection of high-quality eco-friendly products
        </motion.p>

        {/* Product Filters */}
        <ProductFilters />

        {/* Product Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <NotFound searchTerm={searchTerm} />
            ) : (
              <>
                {/* Show search results message */}
                {displaySearchMessage()}

                {/* Show active filters message when filters are applied but no search term */}
                {hasActiveFilters && !searchTerm && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-emerald-400 mb-2">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "Product" : "Products"}{" "}
                      Found
                    </h2>
                    <p className="text-gray-300">Filtered products</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination />
              </>
            )}
          </>
        )}

        {/* Featured Products Carousel */}
        {!isLoading && featuredProducts.length > 0 && !hasActiveFilters && (
          <div className="mt-16">
            <ProductCarousel
              products={featuredProducts}
              title={"Featured Products"}
              titleColor="emerald"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
