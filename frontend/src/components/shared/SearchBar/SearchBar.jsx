"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../../stores/useProductStore";
import Button from "../Button/Button";

const SearchBar = ({ className, mobile = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { searchProducts, resetFilters } = useProductStore();
  const searchRef = useRef(null);

  useEffect(() => {
    // This effect will run whenever searchTerm changes
    if (searchTerm.length >= 3) {
      searchProducts(searchTerm);
      if (!window.location.pathname.includes("/")) {
        navigate("/");
      }
    } else if (searchTerm.length === 0) {
      // Reset search when clearing the input
      searchProducts("");
      // Make sure we reset the search results
      resetFilters();
    }
  }, [searchTerm, searchProducts, resetFilters, navigate]); // Dependencies for the effect

  // Add click outside listener to close mobile search
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        isExpanded
      ) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate("/");
      if (mobile) setIsExpanded(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (mobile) setIsExpanded(false);
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // For mobile: toggle search bar visibility
  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(
        () =>
          document
            .getElementById(mobile ? "mobile-search" : "desktop-search")
            ?.focus(),
        100
      );
    }
  };

  return (
    <div className={`relative ${className} md:w-full md:pl-10`}>
      {mobile ? (
        <>
          {!isExpanded ? (
            <button
              onClick={toggleSearch}
              className="h-[16px] text-gray-300 hover:text-emerald-400 transition duration-300"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>
          ) : (
            <form
              ref={searchRef}
              onSubmit={handleSearch}
              className="fixed left-0 right-0 top-0 z-50 flex items-center bg-gray-800 rounded-md overflow-hidden mx-4 mt-16"
            >
              <input
                id="mobile-search"
                type="text"
                value={searchTerm}
                onChange={handleSearchInput}
                placeholder="Search products..."
                className="w-full bg-gray-800 text-white px-3 py-2 outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-white p-2"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </form>
          )}
        </>
      ) : (
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-gray-800 rounded-md overflow-hidden"
        >
          <input
            id="desktop-search"
            type="text"
            value={searchTerm}
            onChange={handleSearchInput}
            placeholder="Search products..."
            className="w-full bg-gray-800 text-white px-3 py-2 outline-none"
          />
          {searchTerm && (
            <Button
              type="button"
              onClick={clearSearch}
              className="bg-none"
              aria-label="Clear search"
            >
              <X size={16} />
            </Button>
          )}
          <Button
            type="submit"
            className=" h-full bg-emerald-600 hover:bg-emerald-500 text-white p-2"
            aria-label="Search"
            isBG={true}
            icon={<Search size={16} />}
          ></Button>
        </form>
      )}
    </div>
  );
};

export default SearchBar;
