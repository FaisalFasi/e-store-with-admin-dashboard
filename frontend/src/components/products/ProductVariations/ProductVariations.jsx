import InputField from "../../shared/InputField/InputField";

export const ProductVariations = (props) => {
  const { currency = "USD" } = props;

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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color <span className="text-red-500 ">*</span>
            </label>
            <InputField
              type="color"
              className="w-full h-10"
              value={variation.color}
              onChange={(e) =>
                props.handleVariationChange(vIndex, "color", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color Name <span className="text-red-500 ">*</span>
            </label>
            <input
              value={variation.colorName}
              onChange={(e) =>
                props.handleVariationChange(vIndex, "colorName", e.target.value)
              }
              placeholder="Color name i.e. Red, Blue, etc."
              className="w-full p-2 mb-4 border rounded text-black"
            />
          </div>

          {/* Color Images */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Images <span className="text-red-500 ">*</span>
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Size
                  </label>
                  <input
                    value={size?.size}
                    onChange={(e) => {
                      console.log("Size value changed:", e.target.value);
                      props.handleSizeChange(
                        vIndex,
                        sIndex,
                        "size",
                        e.target.value
                      );
                    }}
                    placeholder="Size value i.e. 32, 34, or S, M, L, XL"
                    className="w-full p-2 mb-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price ({currency})
                  </label>
                  <input
                    type="number"
                    value={size.price?.amount || ""}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;

                      props.handleSizeChange(vIndex, sIndex, "price", {
                        amount: amount,
                        currency: currency,
                      });
                    }}
                    min={0}
                    step={1}
                    placeholder={`Price in ${currency}`}
                    className="w-full p-2 mb-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={size.quantity || ""}
                    onChange={(e) =>
                      props.handleSizeChange(
                        vIndex,
                        sIndex,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min={0}
                    max={10000}
                    step={1}
                    placeholder="Quantity i.e. 10, 20, 30"
                    className="w-full p-2 mb-2 border rounded"
                  />
                </div>
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
