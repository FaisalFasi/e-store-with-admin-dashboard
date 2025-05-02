"use client";

import { SearchX } from "lucide-react";
import Button from "../Button/Button";
import { useProductStore } from "../../../stores/useProductStore";

const NotFound = ({ searchTerm }) => {
  const { resetFilters } = useProductStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <SearchX size={64} className="text-emerald-400 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">No products found</h2>
      {searchTerm ? (
        <p className="text-gray-300 mb-6">
          We couldn't find any products matching "{searchTerm}"
        </p>
      ) : (
        <p className="text-gray-300 mb-6">
          No products match your current filter settings
        </p>
      )}
      <Button
        onClick={resetFilters}
        className="bg-emerald-600 hover:bg-emerald-500"
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default NotFound;
