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

  // Render the label with an asterisk if the field is required
  const renderLabel = () => {
    if (!label) return null;
    return (
      <label
        htmlFor={id || name}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    );
  };

  // Render the input element based on the type
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
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
        );

      case "select":
        return (
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
        );

      // In InputField.js - Update the file input rendering
      case "file":
        return (
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
            {/* Preview images with delete buttons */}
            <div className="mt-3 flex flex-wrap gap-4">
              {selectedImages?.map((image, imageIndex) => (
                <div key={imageIndex} className="relative group">
                  <img
                    src={
                      typeof image === "object"
                        ? URL.createObjectURL(image)
                        : image
                    }
                    alt={`Preview ${imageIndex + 1}`}
                    className="h-20 w-20 object-cover rounded-md border-2 border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(imageIndex)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <input
            type={type}
            id={id || name}
            name={name}
            value={value || ""}
            onChange={(e) => {
              onChange(e); // Pass entire event for tags handling
            }}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            min={type === "number" ? min : undefined}
            accept={type === "file" ? accept : undefined}
            className={baseClass}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {renderLabel()}
      {renderInput()}
    </div>
  );
};

export default InputField;
