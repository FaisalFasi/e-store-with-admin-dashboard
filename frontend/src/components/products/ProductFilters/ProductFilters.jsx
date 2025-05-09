"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { useProductStore } from "../../../stores/useProductStore";
import { useCategoryStore } from "../../../stores/useCategoryStore";
import Button from "../../shared/Button/Button";
import { usePrice } from "@/utils/currency/currency";

const ProductFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [basePriceRange, setBasePriceRange] = useState([0, 10000]); // Store in USD cents (base currency)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("none");

  // Get currency conversion utilities
  const { formatPrice, convertPrice, selectedCurrency } = usePrice();

  const { categories } = useCategoryStore();
  const {
    applyFilters,
    resetFilters,
    activeFilters,
    minPrice,
    maxPrice,
    filteredProducts,
  } = useProductStore();

  // Initialize price range based on product store data
  useEffect(() => {
    if (minPrice !== undefined && maxPrice !== undefined) {
      // Use base currency values (USD cents) for internal state
      const baseMinPrice =
        activeFilters.minPrice !== null && activeFilters.minPrice !== undefined
          ? activeFilters.minPrice
          : minPrice;
      const baseMaxPrice =
        activeFilters.maxPrice !== undefined && activeFilters.maxPrice !== null
          ? activeFilters.maxPrice
          : maxPrice;

      // Ensure values are numbers and in cents
      const safeBaseMinPrice = Number(baseMinPrice) || 0;
      const safeBaseMaxPrice = Number(baseMaxPrice) || 10000;

      console.log("safeBaseMinPrice:", safeBaseMinPrice);
      console.log("safeBaseMaxPrice:", safeBaseMaxPrice);
      setBasePriceRange([safeBaseMinPrice, safeBaseMaxPrice]);
    }
  }, [minPrice, maxPrice, activeFilters]);

  // Initialize selected categories from active filters
  useEffect(() => {
    if (activeFilters.categories && Array.isArray(activeFilters.categories)) {
      setSelectedCategories(activeFilters.categories);
    }
    if (activeFilters.sortBy) {
      setSortOption(activeFilters.sortBy);
    }
  }, [activeFilters]);

  // Convert base price (USD cents) to current currency for display
  const getDisplayPrice = useCallback(
    (priceInCents) => {
      // First convert from cents to dollars, then format
      return formatPrice(priceInCents);
    },
    [formatPrice]
  );

  // Convert from display value back to base currency (USD cents)
  const getBasePriceFromDisplay = useCallback(
    (displayValue) => {
      // This is tricky - we need to convert from the current currency back to USD cents
      // First convert to a number
      const numValue = Number(displayValue) || 0;

      // Convert back to USD (divide by exchange rate) and multiply by 100 for cents
      return Math.round(
        (numValue / (selectedCurrency.exchangeRate || 1)) * 100
      );
    },
    [selectedCurrency]
  );

  const handlePriceChange = (index, displayValue) => {
    // Convert the slider value (which is in base currency cents) to base currency cents
    const basePriceInCents = Number(displayValue);

    // Update the base price range
    const newBasePriceRange = [...basePriceRange];
    newBasePriceRange[index] = basePriceInCents;
    setBasePriceRange(newBasePriceRange);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApplyFilters = useCallback(() => {
    // Make sure price range is ordered correctly (min <= max)
    const orderedPriceRange = [
      Math.min(basePriceRange[0], basePriceRange[1]),
      Math.max(basePriceRange[0], basePriceRange[1]),
    ];

    // Apply filters with price values in base currency (USD cents)
    const filterParams = {
      minPrice: orderedPriceRange[0],
      maxPrice: orderedPriceRange[1],
      categories: selectedCategories,
      sortBy: sortOption,
    };

    applyFilters(filterParams);

    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [basePriceRange, selectedCategories, sortOption, applyFilters]);

  // Auto-apply filters when sort option changes
  useEffect(() => {
    // Only auto-apply if we're not in the initial render
    if (
      activeFilters.sortBy !== undefined &&
      activeFilters.sortBy !== sortOption
    ) {
      handleApplyFilters();
    }
  }, [sortOption, activeFilters.sortBy, handleApplyFilters]);

  const handleResetFilters = () => {
    resetFilters();

    // Ensure values are numbers and in cents
    const safeMinPrice = Number(minPrice) || 0;
    const safeMaxPrice = Number(maxPrice) || 10000;

    setBasePriceRange([safeMinPrice, safeMaxPrice]);
    setSelectedCategories([]);
    setSortOption("none");
  };

  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedCategories.length > 0 ||
      basePriceRange[0] > (Number(minPrice) || 0) ||
      basePriceRange[1] < (Number(maxPrice) || 10000) ||
      sortOption !== "none"
    );
  };
  return (
    <div className="relative mb-6">
      {/* Mobile filter button */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={toggleFilters}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
        >
          <Filter size={18} />
          Filters
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={handleResetFilters}
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div
        className={`
        md:block
        ${isOpen ? "block" : "hidden"}
        bg-gray-800 rounded-lg p-4 shadow-lg
        md:bg-transparent md:shadow-none md:p-0
        ${isOpen ? "absolute z-30 left-0 right-0" : ""}
      `}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-400">Price Range</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>{getDisplayPrice(basePriceRange[0])}</span>
                <span>{getDisplayPrice(basePriceRange[1])}</span>
              </div>
              <input
                type="range"
                min={minPrice || 0}
                max={maxPrice || 10000}
                value={basePriceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="w-full accent-emerald-500"
              />
              <input
                type="range"
                min={minPrice || 0}
                max={maxPrice || 10000}
                value={basePriceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-400">Categories</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCategoryToggle(category._id)}
                      className="accent-emerald-500"
                    />
                    <span className="text-gray-300">{category.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No categories available</p>
              )}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-400">Sort By</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOption === "none"}
                  onChange={() => setSortOption("none")}
                  className="accent-emerald-500"
                />
                <span className="text-gray-300">None</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOption === "featured"}
                  onChange={() => setSortOption("featured")}
                  className="accent-emerald-500"
                />
                <span className="text-gray-300">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOption === "price-low-high"}
                  onChange={() => setSortOption("price-low-high")}
                  className="accent-emerald-500"
                />
                <span className="text-gray-300">Price: Low to High</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOption === "price-high-low"}
                  onChange={() => setSortOption("price-high-low")}
                  className="accent-emerald-500"
                />
                <span className="text-gray-300">Price: High to Low</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOption === "newest"}
                  onChange={() => setSortOption("newest")}
                  className="accent-emerald-500"
                />
                <span className="text-gray-300">Newest First</span>
              </label>
            </div>
          </div>

          {/* Apply/Reset Buttons */}
          <div className="space-y-3 flex flex-col justify-end">
            <Button onClick={handleApplyFilters} isBG={true}>
              Apply Filters
            </Button>
            <Button onClick={handleResetFilters} isBG={false}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
