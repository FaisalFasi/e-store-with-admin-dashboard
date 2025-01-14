import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../../../stores/useProductStore";
import toast from "react-hot-toast";
import { validateImages } from "../../../utils/imageUtils/imageUtils";
import InputField from "../../shared/InputField/InputField";
import Button from "../../shared/Button/Button";

const categoriesWithSubCategories = {
  Electronics: ["Smartphones", "Laptops", "Headphones"],
  Clothing: ["Shirts", "Pants", "Jackets"],
  jeans: ["Slim Fit", "Regular Fit", "Bootcut"],
  "t-shirts": ["Round Neck", "V-Neck", "Polo"],
  shoes: ["Casual", "Formal", "Sports"],
};
const variationFields = [
  { name: "size", label: "Size", type: "text", required: true },
  { name: "color", label: "Color", type: "text", required: true },
  {
    name: "quantity",
    label: "Quantity",
    type: "number",
    required: true,
    min: 0,

    step: 1,
  },
  {
    name: "price",
    label: "Price",
    type: "number",
    placeholder: "Enter price for this variation",
    required: true,
    min: 0,
  },
  {
    name: "images",
    label: "Upload Images",
    type: "file",
    accept: "image/*",
    placeholder: "Choose product images",
    required: true,
  },
];

const initializeVariation = {
  size: "",
  color: "",
  quantity: 0,
  price: "",
  images: [],
};

const initailProductState = {
  name: "",
  description: "",
  category: Object.keys(categoriesWithSubCategories)[0],
  subCategory: Object.values(categoriesWithSubCategories)[0][0],
  variations: [initializeVariation],
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
      required: true,
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

    // const formData = new FormData(e.target);
    const formData = new FormData();

    console.log("New Product ------->>", newProduct);

    // Append the product data to the form data
    for (const key in newProduct) {
      if (key === "variations") {
        const formattedVariations = await Promise.all(
          newProduct[key].map(async (variation, variationIndex) => {
            const { images, ...variationDetails } = variation;

            // Process images into `File` objects and append them to FormData
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

            // Return only metadata for variations (no files here)
            return {
              ...variationDetails,
              images: processedImages.length
                ? processedImages.map(
                    (_, idx) => `variations[${variationIndex}].images[${idx}]`
                  )
                : [], // Placeholder for image references
            };
          })
        );

        // Append variations metadata (no actual files) as JSON
        formData.append("variations", JSON.stringify(formattedVariations));
        // formData.append("variations", JSON.stringify(formattedVariations));
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

  // for (const key in newProduct) {
  //   if (key === "variations") {
  //     // First, ensure that your variations are correctly formatted
  //     const formattedVariations = newProduct[key].map((variation) => {
  //       // If you want to handle images separately, you can do it here.
  //       const { images, ...variationDetails } = variation;

  //       // You can handle image appending separately if needed, or just handle variations
  //       return {
  //         ...variationDetails,
  //         images: images || [], // You can leave it empty if no images are present
  //       };
  //     });

  //     // Now append the formatted variations to the FormData as a JSON string
  //     formData.append("variations", JSON.stringify(formattedVariations));
  //   } else {
  //     formData.append(key, newProduct[key]);
  //   }
  // }
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
