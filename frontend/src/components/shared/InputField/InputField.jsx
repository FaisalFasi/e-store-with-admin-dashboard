import React from "react";

const InputField = ({
  type = "text", // Default type is text
  id,
  name,
  label,
  value,
  onChange,
  options = [], // For select input type
  accept = "image/*", // For file input type
  rows, // For textarea input type
  required = false,
  className = "",
  placeholder,
  multiple = true,
  selectedImages = [],
  handleImageRemove,
  fileInputRef = null,
  disabled = false,
}) => {
  // console.log("selectedImages", selectedImages);
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
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
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
          id={name}
          name={name}
          value={value}
          disabled={disabled}
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
      ) : type === "file" ? (
        <div>
          <input
            type="file"
            id={name}
            name={name}
            ref={fileInputRef}
            onChange={(e) => onChange(e)}
            accept={accept}
            multiple={multiple}
            required={required}
            className="mt-1 block w-full bg-gray-700 border border-gray-500 rounded-md shadow-sm py-2 
          px-3  focus:outline-none focus:ring-2
         focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div className="mt-3 flex flex-wrap gap-4">
            {selectedImages[0] != null &&
              selectedImages.length > 0 &&
              selectedImages?.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Uploaded ${index}`}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
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
          id={name}
          name={name}
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
