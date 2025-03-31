import { useState, useEffect, useRef } from "react";

const Select = ({ options, selectedOption, onChange, isColor = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onChange(value); // Pass the color object directly
    setIsOpen(false);
  };

  const baseClass =
    "w-full flex items-center justify-between  bg-gray-800 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-0 focus:ring-emerald-500 focus:border-emerald-500 transition-colors z-[9999]";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={baseClass}
      >
        <div className="flex items-center space-x-3">
          {selectedOption ? (
            <>
              {isColor && (
                <div
                  className="w-5 h-5 rounded-full border border-gray-600"
                  style={{ backgroundColor: selectedOption }}
                />
              )}

              <span className="text-gray-200">{selectedOption}</span>
            </>
          ) : (
            <span className="text-gray-400">Please select an option </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[9999] max-h-80 overflow-auto">
          <div className="space-y-1 p-1">
            {options.map((option, index) => (
              <button
                key={option.hex || index}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full flex items-center space-x-3 p-1 hover:bg-emerald-600 rounded-md transition-colors"
              >
                {isColor && (
                  <div
                    className="w-6 h-6 rounded-full border border-gray-600"
                    style={{ backgroundColor: option }}
                  />
                )}

                <span className="text-gray-200">{option}</span>
                {selectedOption && (
                  <svg
                    className="w-5 h-5 text-emerald-300 ml-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
