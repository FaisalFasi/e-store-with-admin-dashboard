import React from "react";

const InputField = ({
  type = "text", // Default type
  id,
  name,
  label,
  value,
  onChange,
  options = [], // For select input type
  accept = "image/*", // For file input type
  rows = 3, // For textarea input type
  required = false,
  className = "",
  placeholder,
  multiple = true, // For file input type
  selectedImages = [], // For displaying selected images
  handleImageRemove = () => {}, // For removing images
  fileInputRef = null, // File input reference
  disabled = false, // To disable the input
  min, // Minimum value for number type
}) => {
  // Shared classes for input elements
  const baseClass =
    "mt-1 block w-full bg-gray-700 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
        </label>
      )}

      {/* Render input types dynamically */}
      {type === "textarea" ? (
        <textarea
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClass}
        />
      ) : type === "select" ? (
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseClass}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <div>
          <input
            type="file"
            id={id || name}
            name={name}
            ref={fileInputRef}
            onChange={onChange}
            accept={accept}
            multiple={multiple}
            required={required}
            className={baseClass}
          />
          {/* Display selected images */}
          <div className="mt-3 flex flex-wrap gap-4">
            {selectedImages?.map((image, imageIndex) => (
              <div key={imageIndex} className="relative">
                <img
                  src={image}
                  alt={`Uploaded ${imageIndex}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(imageIndex)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <input
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          min={type === "number" ? min : undefined}
          accept={type === "file" ? accept : undefined}
          className={baseClass}
        />
      )}
    </div>
  );
};

export default InputField;
