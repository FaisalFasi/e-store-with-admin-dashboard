import React from "react";
import { Link } from "react-router-dom";

const Button = ({
  to,
  onClick,
  isBG = false,
  children,
  className = "",
  icon,

  disabled,
}) => {
  const baseClasses =
    "text-sm md:text-base lg:text-lg px-2 py-2 md:px-4 font-bold rounded-md flex items-center justify-center transition duration-300 ease-in-out";

  const bgClasses = isBG
    ? "bg-emerald-600 hover:bg-emerald-700 text-gray-300"
    : "bg-gray-700 text-gray-300  hover:bg-gray-600";

  const combinedClasses = `${baseClasses} ${bgClasses} ${className}`;

  // Render as a link if "to" is provided
  if (to) {
    return (
      <Link to={to} className={combinedClasses} disabled={disabled}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  // Render as a button otherwise
  return (
    <button onClick={onClick} className={combinedClasses} disabled={disabled}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
