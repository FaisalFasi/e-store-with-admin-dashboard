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
    handleSizeChange,
    addSizeToColor,
    removeSizeFromColor,
    handleSizeImageChange,
    removeSizeImage,
  } = useProductForm();

  const inputFields = [
    {
      name: "name",
      label: "Product Name", // Add asterisk for required field
      type: "text",
      value: newProduct?.name,
      placeholder: "Enter product name",
      required: true,
    },
    {
      name: "description",
      label: "Description", // Add asterisk for required field
      type: "textarea",
      value: newProduct?.description,
      placeholder: "Enter product description",
      rows: 3,
      required: false,
    },
    {
      name: "basePrice",
      label: "Base Price",
      type: "number",
      value: newProduct?.basePrice,
      placeholder: "Enter base price",
      required: true,
    },
    {
      name: "stock",
      label: "Initial Stock",
      type: "number",
      value: newProduct?.stock,
      placeholder: "Enter initial stock",
      required: true,
    },
    {
      name: "tags",
      label: "Tags (comma separated)",
      type: "text",
      value: newProduct?.tags?.join(", ") || "", // Keep it as a string
      placeholder: "Product tags i.e. tag1, tag2, tag3",
      required: false,
      onChange: (e) => {
        handleInputChange("tags", e.target.value); // Store as raw string while typing
      },
    },

    {
      name: "category",
      label: "Category", // Add asterisk for required field
      type: "select",
      value: newProduct?.category,
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
            value: newProduct?.subCategory,
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
            value: newProduct?.grandChildCategory,
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
      value: newProduct?.isFeatured,
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
      value: newProduct?.status,
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
    console.log("New Product in handle submit -- ", newProduct);

    // Validate first variation
    const firstVariation = newProduct.variations[0];
    if (
      !firstVariation.color ||
      !firstVariation.colorName ||
      firstVariation.colorImages.length === 0 ||
      firstVariation.sizes.some(
        (size) => !size.value || size.price <= 0 || size.quantity < 0
      )
    ) {
      toast.error("First variation must be completely filled");
      return;
    }

    const formData = new FormData();

    // Append main product fields
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("basePrice", newProduct.basePrice);
    formData.append("stock", newProduct.stock);
    formData.append("tags", JSON.stringify(newProduct.tags)); // Ensure tags are sent as a JSON string
    formData.append(
      "category",
      JSON.stringify({
        parent: newProduct.category,
        child: newProduct.subCategory,
        grandchild: newProduct.grandChildCategory,
      })
    );

    // Process variations
    const variations = await Promise.all(
      newProduct.variations.map(async (variation, vIndex) => {
        // Convert Blob URLs to File objects
        const colorImages = await Promise.all(
          variation.colorImages.map(async (blobUrl, fIndex) => {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const fileName = `variation-${vIndex}-colorImage-${fIndex}.${
              blob.type.split("/")[1]
            }`;
            return new File([blob], fileName, { type: blob.type });
          })
        );

        // Append color images to FormData
        colorImages.forEach((file, fIndex) => {
          formData.append(`variations[${vIndex}].colorImages`, file);
        });

        // Return variation data without images (images are appended separately)
        return {
          color: variation.color,
          colorName: variation.colorName,
          sizes: variation.sizes,
        };
      })
    );

    // Append variations as JSON string
    formData.append("variations", JSON.stringify(variations));

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const data = await createProduct(formData);
      if (data) {
        setNewProduct({
          ...initailProductState, // Reset to initial state
          variations: [{ ...initailProductState.variations[0] }], // Keep the first variation
        });
        toast.success("Product created successfully!");
      }
    } catch (error) {
      toast.error(error.message);
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
          variations={newProduct?.variations}
          handleVariationChange={handleVariationChange}
          removeVariation={removeVariation}
          removeImage={removeImage}
          addVariation={addVariation}
          fileInputRef={fileInputRef}
          addSizeToColor={addSizeToColor}
          removeSizeFromColor={removeSizeFromColor}
          handleSizeChange={handleSizeChange}
          handleSizeImageChange={handleSizeImageChange}
          removeSizeImage={removeSizeImage}
        />

        <Button
          type="submit"
          isBG={true}
          disabled={loading}
          className="w-full"
          onSubmit={handleSubmit}
        >
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
