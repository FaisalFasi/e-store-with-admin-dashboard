import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../../../stores/useProductStore";
import toast from "react-hot-toast";
import {
  validateImages,
  handleImageValidation,
  removeImageFromList,
} from "../../../utils/imageUtils/imageUtils";
import InputField from "../../shared/InputField/InputField";

const categories = [
  "jeans",
  "t-shirts",
  "shoes",
  "glasses",
  "jackets",
  "suits",
  "bags",
];
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
  price: "",
  category: "",
  subCategory: "", // Add subCategory to track selected sub-category
  quantity: 1,
  images: [],
  variations: [
    {
      size: "",
      color: "",
      quantity: 0,
      price: "",
    },
  ], // New state for product variations
};

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState(initailProductState);
  const fileInputRef = useRef(null); // Create a ref to the file input
  const [categoryData, setCategoryData] = useState({
    selectedCategory: "",
    subCategories: [],
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
      name: "price",
      label: "Price",
      type: "number",
      value: newProduct.price,
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
    {
      name: "subCategory",
      label: "Sub-category",
      type: "select",
      value: newProduct.subCategory || "", // Set the first sub-category as default
      options: categoryData.subCategories.map((subCategory) => ({
        value: subCategory,
        label: subCategory,
      })),
      onChange: (e) => handleInputChange("subCategory", e.target.value),
      disabled: categoryData.subCategories.length > 0, // Disable if no sub-categories available
    },
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
      name: "images",
      label: "Upload Images",
      type: "file",
      accept: "image/*",
      placeholder: "Choose product images",
    },
  ];

  useEffect(() => {}, []);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryData({
      selectedCategory: selectedCategory,
      subCategories: categoriesWithSubCategories[selectedCategory] || [],
    });
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      category: selectedCategory,
    }));
  };

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    console.log("New ------- ", newProduct);

    // formData.append("name", newProduct.name);
    // formData.append("description", newProduct.description);
    // formData.append("price", newProduct.price);
    // formData.append("category", newProduct.category);
    // formData.append("quantity", newProduct.quantity);

    newProduct.images.forEach((image) => {
      // set the field name as 'images' which is expected by the backend
      formData.set("images", image); // 'images' must match your backend field
    });

    try {
      const data = await createProduct(formData);
      if (data) {
        setNewProduct({
          name: "",
          description: "",
          price: "",
          category: "",
          quantity: 0,
          images: [],
        });
      }
    } catch {
      console.log("Error creating a product");
    }
  };
  const handleInputChange = (key, value) => {
    // check if key is image and value is not null
    if (key === "images") {
      const validatedImages = validateImages(value);

      setNewProduct((prevProduct) => ({
        ...prevProduct,
        images: [...prevProduct.images, ...validatedImages], // Append new images
      }));
    } else {
      setNewProduct((prev) => ({ ...prev, [key]: value }));
    }
  };

  const removeImage = (index) => {
    const updateImages = removeImageFromList(newProduct.images, index);

    setNewProduct((prev) => ({
      ...prev,
      images: updateImages,
    }));

    if (updateImages.length <= 0) fileInputRef.current.value = "";
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
            handleImageRemove={removeImage}
            selectedImages={newProduct?.images}
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
        {newProduct.variations.map((variation, index) => (
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
              {variationFields.map((field) => (
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
