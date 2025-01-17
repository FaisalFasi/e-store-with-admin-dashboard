import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../../../stores/useProductStore";
import toast from "react-hot-toast";
import { validateImages } from "../../../utils/imageUtils/imageUtils";
import InputField from "../../shared/InputField/InputField";
import Button from "../../shared/Button/Button";
import { useCategoryStore } from "../../../stores/useCategoryStore";
import {
  variationFields,
  initializeVariation,
} from "../../../helpers/productHelopers/productHelper.js";

const categoriesWithSubCategories = {
  Electronics: ["Smartphones", "Laptops", "Headphones"],
  Clothing: ["Shirts", "Pants", "Jackets"],
  jeans: ["Slim Fit", "Regular Fit", "Bootcut"],
  "t-shirts": ["Round Neck", "V-Neck", "Polo"],
  shoes: ["Casual", "Formal", "Sports"],
};

const CreateProductForm = () => {
  const { createProduct, loading } = useProductStore();
  const { parentCategories, subCategories } = useCategoryStore();

  const initailProductState = {
    name: "",
    description: "",
    category: parentCategories,
    subCategory: subCategories,
    variations: [initializeVariation],
  };
  const [newProduct, setNewProduct] = useState(initailProductState);
  const fileInputRef = useRef(null); // Create a ref to the file input
  const [categoryData, setCategoryData] = useState({
    selectedCategory: "", // Initially empty
    subCategories: [], // Initially an empty array
  });

  useEffect(() => {
    if (parentCategories.length > 0) {
      setCategoryData((prev) => ({
        ...prev,
        selectedCategory: parentCategories,
      }));
    }

    if (subCategories.length > 0) {
      setCategoryData((prev) => ({
        ...prev,
        subCategories: subCategories, // Set the first subcategory list as default
      }));
    }
    console.log("Sub Categories ------->>", subCategories);
    console.log("Parent Categories ------->>", parentCategories);
  }, [parentCategories, subCategories]);

  const subCategoryField =
    categoryData?.subCategories && Array.isArray(categoryData.subCategories)
      ? categoryData.subCategories.map((subCategory) => ({
          value: subCategory,
          label: subCategory,
        }))
      : [];

  const inputFields = [
    {
      name: "name",
      label: "Product Name",
      type: "text",
      value: newProduct.name,
      placeholder: "Enter product name",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      value: newProduct.description,
      placeholder: "Enter product description",
      rows: 3,
      required: true,
    },

    {
      name: "category",
      label: "Category",
      type: "select",
      value: categoryData.selectedCategory,

      options: parentCategories?.map((category) => ({
        value: category,
        label: category,
      })),
      onChange: (e) => handleCategoryChange(e),
      placeholder: "Select product category",
      required: true,
    },
    ...(categoryData?.subCategories?.length > 0
      ? [
          {
            name: "subCategory",
            label: "Sub-category",
            type: "select",
            value: newProduct.subCategory[0] || [], // Default value
            options: subCategoryField,
            onChange: (e) => handleInputChange("subCategory", e.target.value),
          },
        ]
      : []),
  ];

  const handleVariationChange = (index, e) => {
    const { name, value, files } = e.target;

    if (files) {
      const validatedImages = validateImages(files);
      const updatedVariations = [...newProduct.variations];
      updatedVariations[index] = {
        ...updatedVariations[index],
        images: [...validatedImages],
      };
      setNewProduct({ ...newProduct, variations: updatedVariations });
    } else {
      const updatedVariations = [...newProduct.variations];
      updatedVariations[index] = { ...updatedVariations[index], [name]: value };
      setNewProduct({ ...newProduct, variations: updatedVariations });
    }
  };

  const addVariation = (e) => {
    e.preventDefault();

    setNewProduct({
      ...newProduct,
      variations: [
        ...newProduct.variations,
        {
          size: "",
          color: "",
          quantity: 0,
          price: "",
          images: [],
        },
      ],
    });
  };
  const removeVariation = (index) => {
    const updatedVariations = newProduct.variations.filter(
      (_, i) => i !== index
    );
    setNewProduct({
      ...newProduct,
      variations: updatedVariations,
    });
  };
  const removeImage = (index, imageIndex) => {
    const updatedVariations = [...newProduct.variations];

    updatedVariations[index].images = updatedVariations[index].images.filter(
      (_, i) => i !== imageIndex
    );

    setNewProduct({ ...newProduct, variations: updatedVariations });

    if (updatedVariations[index].images.length <= 0)
      fileInputRef.current.value = "";
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const subCategories = categoriesWithSubCategories[selectedCategory] || [];

    console.log("Selected Category ------->>", selectedCategory);
    setCategoryData({
      selectedCategory,
      subCategories,
    });
    setNewProduct((prev) => ({
      ...prev,
      category: selectedCategory,
      subCategory: subCategories.length > 0 ? subCategories[0] : "",
    }));
  };

  const handleInputChange = (key, value) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append the product data to the form data
    for (const key in newProduct) {
      if (key === "variations") {
        const formattedVariations = await Promise.all(
          newProduct[key].map(async (variation, variationIndex) => {
            const { images, ...variationDetails } = variation;

            console.log("Images ------->>", images);

            const processedImages = await Promise.all(
              (images || []).map(async (blobUrl, imageIndex) => {
                const response = await fetch(blobUrl);
                const blob = await response.blob();

                // get the filename with image dynamic name and type
                const fileName = `variation-${variationIndex}-image-${imageIndex}.${
                  blob.type.split("/")[1]
                }`;
                console.log("File Name ------->>", fileName);

                formData.append(
                  `variations[${variationIndex}].images[${imageIndex}]`,
                  new File([blob], fileName, { type: blob.type })
                );
              })
            );

            console.log("Processed Images ------->>", processedImages);
            // Return only metadata for variations (no files here)
            return {
              ...variationDetails,
            };
          })
        );

        formData.append("variations", JSON.stringify(formattedVariations));
      } else {
        formData.append(key, newProduct[key]);
      }
    }

    console.log("Form Data entries ------->>", Object.fromEntries(formData));

    const data = await createProduct(formData);
    console.log("Data after API call ------->>", data);

    // Reset form and state if submission is successful
    if (data.message) {
      toast.success("Product created successfully!");
      // Optionally reset the form and state
      // setNewProduct(initailProductState);
      // if (fileInputRef?.current) {
      //   fileInputRef.current.value = ""; // Clear file input
      // }
    }
  };

  const processedImagesFunc = async (images, variationIndex, formData) => {
    const imageReferences = [];

    await Promise.all(
      (images || []).map(async (blobUrl, imageIndex) => {
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // get the filename with image dynamic name and type
        const fileName = `variation-${variationIndex}-image-${imageIndex}.${
          blob.type.split("/")[1]
        }`;
        console.log("File Name ------->>", fileName);

        formData.append(
          `variations[${variationIndex}].images[${imageIndex}]`,
          new File([blob], fileName, { type: blob.type })
        );
        imageReferences.push(
          `variations[${variationIndex}].images[${imageIndex}]`
        );
      })
    );
    return imageReferences;
  };

  return (
    <motion.div
      className="bg-gray-800 w-full p-4 rounded-lg md:p-4 mb-8 md:max-w-xl lg:max-w-2xl "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product name, description, price, and category fields (same as your code) */}
        {inputFields.map((field) => (
          <InputField
            key={field.name}
            placeholder={field.placeholder}
            multiple={true}
            fileInputRef={fileInputRef}
            // handleImageRemove={removeImage}
            // selectedImages={newProduct?.images}
            disabled={field.disabled}
            {...field}
            onChange={(e) =>
              field.onChange
                ? field.onChange(e)
                : handleInputChange(field.name, e.target.value)
            }
          />
        ))}
        {/* Product variations */}
        {/* Variations */}
        {newProduct?.variations?.map((variation, variationsIndex) => (
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
                  } // Pass remove function
                  fileInputRef={fileInputRef}
                  selectedImages={
                    newProduct.variations[variationsIndex]?.images
                  }
                  disabled={field.disabled}
                  value={variation[field.name]}
                  {...field}
                  onChange={(e) => handleVariationChange(variationsIndex, e)}
                />
              ))}
            </div>
          </div>
        ))}
        <Button
          type="button"
          isBG={true}
          onClick={addVariation}
          className="w-full"
        >
          Add Variation
        </Button>

        <Button type="submit" isBG={true} disabled={loading} className="w-full">
          {loading ? (
            <span className="flex items-center">
              <Loader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading...
            </span>
          ) : (
            <span className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
