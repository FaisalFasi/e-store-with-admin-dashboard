// Tooltip.jsx
import React from "react";

const Tooltip = ({ children, text }) => {
  return (
    <div className="relative group">
      {/* Text that gets truncated */}
      <div className="text-sm font-medium text-white overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[10ch] md:max-w-[15ch] lg:max-w-[20ch]">
        {children}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-6 w-max p-2 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
