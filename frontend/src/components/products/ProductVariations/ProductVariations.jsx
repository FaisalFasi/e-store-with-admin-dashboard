// components/ProductVariations.js
import InputField from "../../shared/InputField/InputField";
import { variationFields } from "../../../helpers/productHelopers/productHelper.js";

export const ProductVariations = ({
  variations,
  fileInputRef,
  handleVariationChange,
  removeVariation,
  removeImage,
  addVariation,
}) => {
  return (
    <>
      {variations.map((variation, variationsIndex) => (
        <div key={variationsIndex} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-emerald-300">
              {variationsIndex === 0
                ? "Required"
                : `Variant ${variationsIndex}`}
            </h3>
            {variationsIndex !== 0 && (
              <button
                type="button"
                onClick={() => removeVariation(variationsIndex)}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                Remove Variant
              </button>
            )}
          </div>
          <div className="">
            {variationFields?.map((field) => (
              <InputField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                accept="image/*"
                placeholder={field.placeholder}
                multiple={true}
                handleImageRemove={(imageIndex) =>
                  removeImage(variationsIndex, imageIndex)
                }
                fileInputRef={fileInputRef}
                selectedImages={variations[variationsIndex]?.images}
                disabled={field.disabled}
                value={variation[field.name]}
                {...field}
                onChange={(e) => handleVariationChange(variationsIndex, e)}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addVariation}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Add Variation
      </button>
    </>
  );
};
