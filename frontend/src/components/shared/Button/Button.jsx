import React from "react";
import { Link } from "react-router-dom";

const Button = ({
  to,
  onClick,
  isBG = false,
  children,
  className = "",
  icon,
}) => {
  const baseClasses =
    "text-sm md:text-base lg:text-lg py-1 px-2 md:py-1  rounded-md flex items-center justify-center gap-2 transition duration-300 ease-in-out";

  const bgClasses = isBG
    ? "bg-emerald-700 hover:bg-emerald-600 text-white"
    : "text-gray-300  hover:text-emerald-400";

  const combinedClasses = `${baseClasses} ${bgClasses} ${className}`;

  // Render as a link if "to" is provided
  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  // Render as a button otherwise
  return (
    <button onClick={onClick} className={combinedClasses}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;