import InputField from "../../shared/InputField/InputField";

// components/ProductVariations.js
export const ProductVariations = (props) => {
  return (
    <div className="space-y-6">
      {props?.variations?.map((variation, vIndex) => (
        <div key={vIndex} className="bg-gray-800 border p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Color Variation #{vIndex + 1}{" "}
              <span className="text-red-500 ">*</span>
            </h3>
            {vIndex != 0 && (
              <button
                type="button"
                onClick={() => props.removeVariation(vIndex)}
                className="text-red-500 hover:text-red-700"
              >
                Remove Color
              </button>
            )}
          </div>

          {/* Color Name */}
          <input
            value={variation.colorName}
            onChange={(e) =>
              props.handleVariationChange(vIndex, "colorName", e.target.value)
            }
            placeholder="Color name"
            className="w-full p-2 mb-4 border rounded text-black"
          />

          {/* Color Images */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color Images
            </label>
            <InputField
              type="file"
              multiple
              onChange={(e) =>
                props.handleVariationChange(
                  vIndex,
                  "colorImages",
                  e.target.files
                )
              }
              selectedImages={variation.colorImages}
              handleImageRemove={(imgIndex) =>
                props.removeImage(vIndex, imgIndex)
              }
            />
          </div>

          {/* Size Variations */}
          <div className="ml-4 space-y-4">
            {variation?.sizes?.map((size, sIndex) => (
              <div
                key={sIndex}
                className="text-gray-400 bg-gray-800 border p-4 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">
                    Size #{sIndex + 1} <span className="text-red-500 ">*</span>
                  </h4>
                  {sIndex !== 0 && (
                    <button
                      type="button"
                      onClick={() => props.removeSizeFromColor(vIndex, sIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove Size
                    </button>
                  )}
                </div>

                <input
                  value={size.value}
                  onChange={(e) =>
                    props.handleSizeChange(
                      vIndex,
                      sIndex,
                      "value",
                      e.target.value
                    )
                  }
                  placeholder="Size value"
                  className="w-full p-2 mb-2 border rounded"
                />

                <input
                  type="number"
                  value={size.price}
                  onChange={(e) =>
                    props.handleSizeChange(
                      vIndex,
                      sIndex,
                      "price",
                      e.target.value
                    )
                  }
                  placeholder="Price"
                  className="w-full p-2 mb-2 border rounded"
                />

                <input
                  type="number"
                  value={size.quantity}
                  onChange={(e) =>
                    props.handleSizeChange(
                      vIndex,
                      sIndex,
                      "quantity",
                      e.target.value
                    )
                  }
                  placeholder="Quantity"
                  className="w-full p-2 mb-2 border rounded"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => props.addSizeToColor(vIndex)}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Size
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={props.addVariation}
        className="text-green-500 hover:text-green-700"
      >
        + Add Color Variation
      </button>
    </div>
  );
};
