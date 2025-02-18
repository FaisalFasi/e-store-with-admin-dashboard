// CreateProductForm.js
import { motion } from "framer-motion";
import { PlusCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useProductForm } from "../../../hooks/useProductForm";
import { useProductStore } from "../../../stores/useProductStore";
import { ProductVariations } from "../ProductVariations/ProductVariations";
import { ProductFormFields } from "../ProductFormFields/ProductFormFields";
import Button from "../../shared/Button/Button";

const CreateProductForm = () => {
  const { createProduct, loading } = useProductStore();
  const {
    categories,
    newProduct,
    setNewProduct,
    fileInputRef,
    categoryData,
    handleCategoryChange,
    handleChildCategoryChange,
    handleGrandChildCategoryChange,
    handleInputChange,
    handleVariationChange,
    addVariation,
    removeVariation,
    removeImage,
    initailProductState,
  } = useProductForm();

  const inputFields = [
    {
      name: "name",
      label: "Product Name", // Add asterisk for required field
      type: "text",
      value: newProduct.name,
      placeholder: "Enter product name",
      required: true,
    },
    {
      name: "description",
      label: "Description", // Add asterisk for required field
      type: "textarea",
      value: newProduct.description,
      placeholder: "Enter product description",
      rows: 3,
      required: false,
    },
    {
      name: "category",
      label: "Category", // Add asterisk for required field
      type: "select",
      value: newProduct.category,
      options: categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
      onChange: handleCategoryChange,
      placeholder: "Select product category",
      required: true,
    },
    ...(categoryData.subCategories.length > 0
      ? [
          {
            name: "subCategory",
            label: "Sub-category", // No asterisk if not required
            type: "select",
            value: newProduct.subCategory,
            options: categoryData.subCategories.map((subCategory) => ({
              value: subCategory._id,
              label: subCategory.name,
            })),
            onChange: handleChildCategoryChange,
            required: true, // Explicitly mark as not required
          },
        ]
      : []),
    ...(categoryData.grandChildCategories.length > 0
      ? [
          {
            name: "grandChildCategory",
            label: "Grand Sub-category", // No asterisk if not required
            type: "select",
            value: newProduct.grandChildCategory,
            options: categoryData.grandChildCategories.map(
              (grandChildCategory) => ({
                value: grandChildCategory._id,
                label: grandChildCategory.name,
              })
            ),
            onChange: handleGrandChildCategoryChange,
            required: true, // Explicitly mark as not required
          },
        ]
      : []),
    {
      name: "isFeatured",
      label: "Featured", // Add asterisk for required field
      type: "select",
      value: newProduct.isFeatured,
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],

      onChange: (e) => handleInputChange("isFeatured", e.target.value),
      placeholder: "Select product featured status",
      required: true,
    },
    {
      name: "status",
      label: "Status", // Add asterisk for required field
      type: "select",
      value: newProduct.status,
      options: [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      onChange: (e) => handleInputChange("status", e.target.value),
      placeholder: "Select product status",
      required: true,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    console.log("----New product --- :", newProduct);
    for (const key in newProduct) {
      if (key === "variations") {
        const formattedVariations = await Promise.all(
          newProduct[key].map(async (variation, variationIndex) => {
            const { images, ...variationDetails } = variation;

            await Promise.all(
              (images || []).map(async (blobUrl, imageIndex) => {
                const response = await fetch(blobUrl);
                const blob = await response.blob();
                const fileName = `variation-${variationIndex}-image-${imageIndex}.${
                  blob.type.split("/")[1]
                }`;
                formData.append(
                  `variations[${variationIndex}].images[${imageIndex}]`,
                  new File([blob], fileName, { type: blob.type })
                );
              })
            );

            return { ...variationDetails };
          })
        );

        formData.append("variations", JSON.stringify(formattedVariations));
      } else {
        formData.append(key, newProduct[key]);
      }
    }

    const data = await createProduct(formData);
    if (data) {
      setNewProduct(initailProductState);
      if (fileInputRef?.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Product created successfully!");
    }
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
        <ProductFormFields
          inputFields={inputFields}
          fileInputRef={fileInputRef}
          handleInputChange={handleInputChange}
          handleCategoryChange={handleCategoryChange}
          handleChildCategoryChange={handleChildCategoryChange}
          handleGrandChildCategoryChange={handleGrandChildCategoryChange}
        />

        <ProductVariations
          variations={newProduct.variations}
          fileInputRef={fileInputRef}
          handleVariationChange={handleVariationChange}
          removeVariation={removeVariation}
          removeImage={removeImage}
          addVariation={addVariation}
        />

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
