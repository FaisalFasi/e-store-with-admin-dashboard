import React from "react";
import { Link } from "react-router-dom";

const Button = ({ to, onClick, children, className = "", icon }) => {
  const baseClasses =
    "bg-emerald-600 hover:bg-emerald-700 text-white py-1 md:py-2 px-2 md:px-4 text-sm md:text-xl rounded-md flex items-center transition duration-300 ease-in-out";

  // Render as a link if "to" is provided
  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Link>
    );
  }

  // Render as a button otherwise
  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
