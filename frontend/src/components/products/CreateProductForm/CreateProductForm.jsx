import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../../../stores/useProductStore";
import toast from "react-hot-toast";
import {
  validateImages,
  removeImageFromList,
} from "../../../utils/imageUtils/imageUtils";
import InputField from "../../shared/InputField/InputField";

const categoriesWithSubCategories = {
  Electronics: ["Smartphones", "Laptops", "Headphones"],
  Clothing: ["Shirts", "Pants", "Jackets"],
  jeans: ["Slim Fit", "Regular Fit", "Bootcut"],
  "t-shirts": ["Round Neck", "V-Neck", "Polo"],
  shoes: ["Casual", "Formal", "Sports"],
};
const variationFields = [
  { name: "size", label: "Size", type: "text" },
  { name: "color", label: "Color", type: "text" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "price", label: "Price", type: "number" },
];

const initailProductState = {
  name: "",
  description: "",
  basePrice: "",
  category: "",
  subCategory: "", // Add subCategory to track selected sub-category
  quantity: 1,
  baseImages: [],
  variations: [],
};

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState(initailProductState);
  const fileInputRef = useRef(null); // Create a ref to the file input
  const [categoryData, setCategoryData] = useState(() => {
    // Ensure categoriesWithSubCategories is available and not empty
    const firstCategory = Object.keys(categoriesWithSubCategories)[0];

    return {
      selectedCategory: firstCategory || "", // Set the first category or empty string if no categories
      subCategories: categoriesWithSubCategories[firstCategory] || [], // Set the subcategories for the first category
    };
  });

  const { createProduct, loading } = useProductStore();

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
    },
    {
      name: "basePrice",
      label: "Price",
      type: "number",
      value: newProduct.basePrice,
      placeholder: "Enter product price",
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      value: categoryData.selectedCategory,

      options: Object.keys(categoriesWithSubCategories).map((category) => ({
        value: category,
        label: category,
      })),
      onChange: (e) => handleCategoryChange(e),
      placeholder: "Select product category",
      required: true,
    },
    ...(categoryData.subCategories.length > 0
      ? [
          {
            name: "subCategory",
            label: "Sub-category",
            type: "select",
            value: newProduct.subCategory || "", // Default value
            options: categoryData.subCategories.map((subCategory) => ({
              value: subCategory,
              label: subCategory,
            })),
            onChange: (e) => handleInputChange("subCategory", e.target.value),
          },
        ]
      : []),
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      value: newProduct.quantity,
      placeholder: "Enter product quantity",
      required: true,
      min: 0,
    },
    {
      name: "baseImages",
      label: "Upload Images",
      type: "file",
      accept: "image/*",
      placeholder: "Choose product images",
    },
  ];

  const handleVariationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariations = [...newProduct.variations];

    updatedVariations[index] = { ...updatedVariations[index], [name]: value };
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  const addVariation = () => {
    setNewProduct({
      ...newProduct,
      variations: [
        ...newProduct.variations,
        {
          size: "",
          color: "",
          quantity: 0,
          price: "",
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

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryData({
      selectedCategory: selectedCategory,
      subCategories: categoriesWithSubCategories[selectedCategory] || [],
    });

    handleInputChange("category", selectedCategory);
  };

  const handleInputChange = (key, value) => {
    // check if key is image and value is not null
    if (key === "images") {
      const validatedImages = validateImages(value);

      setNewProduct((prevProduct) => ({
        ...prevProduct,
        baseImages: [...prevProduct.baseImages, ...validatedImages], // Append new images
      }));
    } else {
      setNewProduct((prev) => ({ ...prev, [key]: value }));
    }
  };

  const removeImage = (index) => {
    const updateImages = removeImageFromList(newProduct.baseImages, index);

    setNewProduct((prev) => ({
      ...prev,
      baseImages: updateImages,
    }));

    if (updateImages.length <= 0) fileInputRef.current.value = "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Add variations to the form data
    if (newProduct.variations.length > 0) {
      console.log("Variations ------->>", newProduct.variations);
      formData.append("variations", JSON.stringify(newProduct.variations));
    }
    console.log("Form Data ------->>", Object.fromEntries(formData.entries()));

    const data = await createProduct(formData);
    console.log("Data after API call ------->>", data.message);

    // Reset form and state if submission is successful
    if (data.message) {
      // setNewProduct(initailProductState);
      // if (fileInputRef?.current) {
      //   fileInputRef.current.value = ""; // Clear file input
      // }
      toast.success("Product created successfully!");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const formData = new FormData(e.target);
  //   console.log("Form Data ------->>", Object.fromEntries(formData.entries()));

  //   const imageFiles = formData.getAll("images");
  //   console.log("Image Files ------->> ", imageFiles);

  //   if (!imageFiles || imageFiles.length === 0) {
  //     return toast.error("Please upload an image");
  //   }

  //   imageFiles.forEach((file, index) => {
  //     formData.append(`images`, file);
  //   });
  //   const formtDataEntries = Object.fromEntries(formData);
  //   console.log("Form Data Entries ------->> ", formtDataEntries);

  //   const data = await createProduct(formtDataEntries);
  //   console.log("Data after ------->> ", data);

  //   if (data) {
  //     setNewProduct(initailProductState);
  //     if (fileInputRef?.current) {
  //       fileInputRef.current.value = "";
  //     }
  //   }
  // };

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
            handleImageRemove={removeImage}
            selectedImages={newProduct?.baseImages}
            disabled={field.disabled}
            {...field}
            onChange={(e) =>
              field.onChange
                ? field.onChange(e)
                : handleInputChange(
                    field.name,
                    field.type === "file" ? e.target.files : e.target.value
                  )
            }
          />
        ))}
        {/* Product variations */}
        {/* Variations */}
        {newProduct?.variations &&
          newProduct?.variations?.map((variation, index) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-emerald-300">
                  Variation {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeVariation(index)}
                  className="text-red-500 hover:text-red-700 mt-2"
                >
                  Remove Variant
                </button>
              </div>
              <div className="">
                {variationFields?.map((field) => (
                  <InputField
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    value={variation[field.name]}
                    onChange={(e) => handleVariationChange(index, e)}
                  />
                ))}
              </div>
            </div>
          ))}
        <button
          type="button"
          onClick={addVariation}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Add Variation
        </button>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
