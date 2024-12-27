import React from "react";

const InputField = ({
  type = "text", // Default type is text
  id,
  label,
  value,
  onChange,
  options = [], // For select input type
  accept, // For file input type
  rows, // For textarea input type
  required = false,
  className = "",
  placeholder,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows || 3}
          required={required}
          placeholder={placeholder}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
            focus:border-emerald-500"
        />
      ) : type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="mt-1 block w-full bg-gray-700 border border-gray-500 rounded-md shadow-sm py-2 
          px-3  focus:outline-none focus:ring-2
         focus:ring-emerald-500 focus:border-emerald-500"
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={type === "number" ? 0 : null} // For number input type
          accept={accept} // For file input type
          className="mt-1 block w-full bg-gray-700 border border-gray-500 rounded-md shadow-sm py-2 
          px-3  focus:outline-none focus:ring-2
         focus:ring-emerald-500 focus:border-emerald-500"
        />
      )}
    </div>
  );
};

export default InputField;
