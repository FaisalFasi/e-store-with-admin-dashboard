"use client";

import { useState, useEffect } from "react";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { useProductStore } from "../../../stores/useProductStore";
import { useCategoryStore } from "../../../stores/useCategoryStore";
import Button from "../../shared/Button/Button";

const ProductFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("featured");

  const { categories } = useCategoryStore();
  const { applyFilters, resetFilters, activeFilters, minPrice, maxPrice } =
    useProductStore();

  // Initialize price range based on product store data
  useEffect(() => {
    if (minPrice !== undefined && maxPrice !== undefined) {
      setPriceRange([
        activeFilters.minPrice || minPrice,
        activeFilters.maxPrice || maxPrice,
      ]);
    }
  }, [minPrice, maxPrice, activeFilters]);

  // Initialize selected categories from active filters
  useEffect(() => {
    if (activeFilters.categories) {
      setSelectedCategories(activeFilters.categories);
    }
    if (activeFilters.sortBy) {
      setSortOption(activeFilters.sortBy);
    }
  }, [activeFilters]);

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    setPriceRange(newRange);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApplyFilters = () => {
    applyFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      categories: selectedCategories,
      sortBy: sortOption,
    });
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setPriceRange([minPrice || 0, maxPrice || 1000]);
    setSelectedCategories([]);
    setSortOption("featured");
  };

  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedCategories.length > 0 ||
      priceRange[0] > (minPrice || 0) ||
      priceRange[1] < (maxPrice || 1000) ||
      sortOption !== "featured"
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
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <input
                type="range"
                min={minPrice || 0}
                max={maxPrice || 1000}
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="w-full accent-emerald-500"
              />
              <input
                type="range"
                min={minPrice || 0}
                max={maxPrice || 1000}
                value={priceRange[1]}
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
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleResetFilters}
              className="w-full bg-gray-700 hover:bg-gray-600"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;

// "use client";

// import { useState, useEffect } from "react";
// import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
// import { useProductStore } from "../../../stores/useProductStore";
// import { useCategoryStore } from "../../../stores/useCategoryStore";
// import Button from "../../shared/Button/Button";
// import { useCurrencyStore } from "../../../stores/useCurrencyStore";

// const ProductFilters = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [priceRange, setPriceRange] = useState([0, 1000]);
//   const [displayPriceRange, setDisplayPriceRange] = useState([0, 1000]);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [sortOption, setSortOption] = useState("featured");

//   const { currency, rate } = useCurrencyStore?.() || {
//     currency: "USD",
//     rate: 1,
//   };
//   const { categories } = useCategoryStore();
//   const { applyFilters, resetFilters, activeFilters, minPrice, maxPrice } =
//     useProductStore();

//   // Initialize price range based on product store data
//   useEffect(() => {
//     if (minPrice !== undefined && maxPrice !== undefined) {
//       // Use base currency values for internal state
//       const baseMinPrice = activeFilters.minPrice || minPrice;
//       const baseMaxPrice = activeFilters.maxPrice || maxPrice;
//       setPriceRange([baseMinPrice, baseMaxPrice]);

//       // Set display values with currency conversion
//       setDisplayPriceRange([baseMinPrice * rate, baseMaxPrice * rate]);
//     }
//   }, [minPrice, maxPrice, activeFilters, rate]);

//   // Initialize selected categories from active filters
//   useEffect(() => {
//     if (activeFilters.categories) {
//       setSelectedCategories(activeFilters.categories);
//     }
//     if (activeFilters.sortBy) {
//       setSortOption(activeFilters.sortBy);
//     }
//   }, [activeFilters]);

//   const handlePriceChange = (index, value) => {
//     // Convert the displayed value back to base currency for internal state
//     const baseValue = Number(value);
//     const newRange = [...priceRange];
//     newRange[index] = baseValue;
//     setPriceRange(newRange);

//     // Update display values
//     const newDisplayRange = [...displayPriceRange];
//     newDisplayRange[index] = baseValue * rate;
//     setDisplayPriceRange(newDisplayRange);
//   };

//   const handleCategoryToggle = (categoryId) => {
//     setSelectedCategories((prev) =>
//       prev.includes(categoryId)
//         ? prev.filter((id) => id !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const handleApplyFilters = () => {
//     // Apply filters with price values in base currency
//     applyFilters({
//       minPrice: priceRange[0],
//       maxPrice: priceRange[1],
//       categories: selectedCategories,
//       sortBy: sortOption,
//     });

//     if (window.innerWidth < 768) {
//       setIsOpen(false);
//     }
//   };

//   const handleResetFilters = () => {
//     resetFilters();
//     setPriceRange([minPrice || 0, maxPrice || 1000]);
//     setDisplayPriceRange([(minPrice || 0) * rate, (maxPrice || 1000) * rate]);
//     setSelectedCategories([]);
//     setSortOption("featured");
//   };

//   const toggleFilters = () => {
//     setIsOpen(!isOpen);
//   };

//   // Check if any filters are active
//   const hasActiveFilters = () => {
//     return (
//       selectedCategories.length > 0 ||
//       priceRange[0] > (minPrice || 0) ||
//       priceRange[1] < (maxPrice || 1000) ||
//       sortOption !== "featured"
//     );
//   };

//   return (
//     <div className="relative mb-6">
//       {/* Mobile filter button */}
//       <div className="md:hidden flex justify-between items-center mb-4">
//         <button
//           onClick={toggleFilters}
//           className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
//         >
//           <Filter size={18} />
//           Filters
//           {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//         </button>

//         {hasActiveFilters() && (
//           <button
//             onClick={handleResetFilters}
//             className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
//           >
//             <X size={16} />
//             Clear
//           </button>
//         )}
//       </div>

//       {/* Filter panel */}
//       <div
//         className={`
//         md:block
//         ${isOpen ? "block" : "hidden"}
//         bg-gray-800 rounded-lg p-4 shadow-lg
//         md:bg-transparent md:shadow-none md:p-0
//         ${isOpen ? "absolute z-30 left-0 right-0" : ""}
//       `}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {/* Price Range */}
//           <div className="space-y-3">
//             <h3 className="font-semibold text-emerald-400">Price Range</h3>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm text-gray-300">
//                 <span>${displayPriceRange[0].toFixed(2)}</span>
//                 <span>${displayPriceRange[1].toFixed(2)}</span>
//               </div>
//               <input
//                 type="range"
//                 min={minPrice || 0}
//                 max={maxPrice || 1000}
//                 value={priceRange[0]}
//                 onChange={(e) => handlePriceChange(0, e.target.value)}
//                 className="w-full accent-emerald-500"
//               />
//               <input
//                 type="range"
//                 min={minPrice || 0}
//                 max={maxPrice || 1000}
//                 value={priceRange[1]}
//                 onChange={(e) => handlePriceChange(1, e.target.value)}
//                 className="w-full accent-emerald-500"
//               />
//             </div>
//           </div>

//           {/* Categories */}
//           <div className="space-y-3">
//             <h3 className="font-semibold text-emerald-400">Categories</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {categories && categories.length > 0 ? (
//                 categories.map((category) => (
//                   <label
//                     key={category._id}
//                     className="flex items-center gap-2 cursor-pointer"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={selectedCategories.includes(category._id)}
//                       onChange={() => handleCategoryToggle(category._id)}
//                       className="accent-emerald-500"
//                     />
//                     <span className="text-gray-300">{category.name}</span>
//                   </label>
//                 ))
//               ) : (
//                 <p className="text-gray-400 text-sm">No categories available</p>
//               )}
//             </div>
//           </div>

//           {/* Sort By */}
//           <div className="space-y-3">
//             <h3 className="font-semibold text-emerald-400">Sort By</h3>
//             <div className="space-y-2">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="radio"
//                   name="sort"
//                   checked={sortOption === "featured"}
//                   onChange={() => setSortOption("featured")}
//                   className="accent-emerald-500"
//                 />
//                 <span className="text-gray-300">Featured</span>
//               </label>
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="radio"
//                   name="sort"
//                   checked={sortOption === "price-low-high"}
//                   onChange={() => setSortOption("price-low-high")}
//                   className="accent-emerald-500"
//                 />
//                 <span className="text-gray-300">Price: Low to High</span>
//               </label>
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="radio"
//                   name="sort"
//                   checked={sortOption === "price-high-low"}
//                   onChange={() => setSortOption("price-high-low")}
//                   className="accent-emerald-500"
//                 />
//                 <span className="text-gray-300">Price: High to Low</span>
//               </label>
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="radio"
//                   name="sort"
//                   checked={sortOption === "newest"}
//                   onChange={() => setSortOption("newest")}
//                   className="accent-emerald-500"
//                 />
//                 <span className="text-gray-300">Newest First</span>
//               </label>
//             </div>
//           </div>

//           {/* Apply/Reset Buttons */}
//           <div className="space-y-3 flex flex-col justify-end">
//             <Button
//               onClick={handleApplyFilters}
//               className="w-full bg-emerald-600 hover:bg-emerald-500"
//             >
//               Apply Filters
//             </Button>
//             <Button
//               onClick={handleResetFilters}
//               className="w-full bg-gray-700 hover:bg-gray-600"
//             >
//               Reset Filters
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductFilters;
