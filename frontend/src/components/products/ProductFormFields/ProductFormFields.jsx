// components/ProductFormFields.js
import InputField from "../../shared/InputField/InputField";

export const ProductFormFields = ({
  inputFields,
  fileInputRef,
  handleInputChange,
  handleCategoryChange,
  handleChildCategoryChange,
  handleGrandChildCategoryChange,
}) => {
  return (
    <>
      {inputFields.map((field) => (
        <InputField
          key={field.name}
          placeholder={field.placeholder}
          multiple={true}
          fileInputRef={fileInputRef}
          disabled={field.disabled}
          {...field}
          onChange={(e) =>
            field.onChange
              ? field.onChange(e)
              : handleInputChange(field.name, e.target.value)
          }
        />
      ))}
    </>
  );
};
