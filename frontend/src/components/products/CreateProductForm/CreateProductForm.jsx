import { memo, useMemo } from "react";
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
    newProduct,
    fileInputRef,
    categoryData,
    handleCategoryChange,
    handleChildCategoryChange,
    handleGrandChildCategoryChange,
    handleGreatGrandChildCategoryChange,
    handleInputChange,
    handleVariationChange,
    addVariation,
    removeVariation,
    removeImage,
    categories,
    handleSizeChange,
    addSizeToColor,
    removeSizeFromColor,
    handleSizeImageChange,
    removeSizeImage,
  } = useProductForm();

  // Memoize input fields to prevent unnecessary re-renders
  const inputFields = useMemo(
    () => [
      {
        name: "name",
        label: "Product Name",
        type: "text",
        value: newProduct?.name,
        placeholder: "Enter product name",
        required: true,
      },
      {
        name: "brand",
        label: "Product Brand",
        type: "text",
        value: newProduct?.brand,
        placeholder: "Enter product brand",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        value: newProduct?.description,
        placeholder: "Enter product description",
        rows: 3,
        required: false,
      },
      {
        name: "price.basePrice",
        label: "Base Price",
        type: "number",
        value: newProduct?.price?.basePrice,
        placeholder: "Enter base price",
        required: true,
        onChange: (e) => handleInputChange("price.basePrice", e.target.value),
      },
      {
        name: "stock",
        label: "Initial Stock",
        type: "number",
        value: newProduct?.stock,
        placeholder: "Enter initial stock",
        required: true,
        min: 0,
      },
      {
        name: "tags",
        label: "Tags (comma separated)",
        type: "text",
        value: newProduct?.tags?.join(", ") || "",
        placeholder: "Product tags i.e. tag1, tag2, tag3",
        required: false,
        onChange: (e) => {
          handleInputChange("tags", e.target.value);
        },
      },
      // Category selection - L1 (Main category)
      {
        name: "category.l1",
        label: "Category",
        type: "select",
        value: newProduct?.category?.l1 || "",
        options: categoryData.l1.map((category) => ({
          value: category._id,
          label: category.name,
        })),
        onChange: handleCategoryChange,
        placeholder: "Select product category",
        required: true,
      },
      // L2 (Sub-category) - Only show if L2 categories exist
      ...(categoryData.l2.length > 0
        ? [
            {
              name: "category.l2",
              label: "Sub-category",
              type: "select",
              value: newProduct?.category?.l2 || "",
              options: categoryData.l2.map((category) => ({
                value: category._id,
                label: category.name,
              })),
              onChange: handleChildCategoryChange,
              placeholder: "Select sub-category",
              required: true,
            },
          ]
        : []),
      // L3 (Grand Sub-category) - Only show if L3 categories exist
      ...(categoryData.l3.length > 0
        ? [
            {
              name: "category.l3",
              label: "Grand Sub-category",
              type: "select",
              value: newProduct?.category?.l3 || "",
              options: categoryData.l3.map((category) => ({
                value: category._id,
                label: category.name,
              })),
              onChange: handleGrandChildCategoryChange,
              placeholder: "Select grand sub-category",
              required: true,
            },
          ]
        : []),
      // L4 (Great Grand Sub-category) - Only show if L4 categories exist
      ...(categoryData.l4.length > 0
        ? [
            {
              name: "category.l4",
              label: "Great Grand Sub-category",
              type: "select",
              value: newProduct?.category?.l4 || "",
              options: categoryData.l4.map((category) => ({
                value: category._id,
                label: category.name,
              })),
              onChange: handleGreatGrandChildCategoryChange,
              placeholder: "Select great grand sub-category",
              required: true,
            },
          ]
        : []),
      {
        name: "isFeatured",
        label: "Featured",
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
        label: "Status",
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
    ],
    [
      newProduct,
      categoryData,
      handleCategoryChange,
      handleChildCategoryChange,
      handleGrandChildCategoryChange,
      handleGreatGrandChildCategoryChange,
      handleInputChange,
    ]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate first variation
    const firstVariation = newProduct.variations[0];
    if (
      !firstVariation.color ||
      !firstVariation.colorName ||
      firstVariation.colorImages.length === 0 ||
      firstVariation.sizes.some(
        (size) => !size.size || size.price.amount <= 0 || size.quantity < 0
      )
    ) {
      toast.error("First variation must be completely filled");
      return;
    }

    try {
      // Create FormData only when validation passes
      const formData = createFormData(newProduct);
      await createProduct(formData);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Extract form data creation to improve readability
  const createFormData = async (product) => {
    const formData = new FormData();

    // Append main product fields
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("stock", product.stock);
    formData.append("isFeatured", product.isFeatured);
    formData.append("status", product.status);
    formData.append("brand", product.brand);
    formData.append("metaTitle", product.metaTitle);
    formData.append("metaDescription", product.metaDescription);

    // Append complex objects as JSON strings
    formData.append("price", JSON.stringify(product.price));
    formData.append("tags", JSON.stringify(product.tags));
    formData.append("images", JSON.stringify(product.images || []));

    const categoryData = {
      l1: product.category.l1 || "",
      l2: product.category.l2 || "",
      l3: product.category.l3 || "",
      l4: product.category.l4 || "",
    };
    formData.append("category", JSON.stringify(categoryData));

    // Process variations
    const variations = await Promise.all(
      product.variations.map(async (variation, vIndex) => {
        // Convert Blob URLs to File objects
        const colorImages = await Promise.all(
          variation.colorImages.map(async (blobUrl, fIndex) => {
            const response = await fetch(blobUrl);

            if (!response.ok) {
              throw new Error("Failed to fetch image");
            }
            const blob = await response.blob();
            const fileName = `variation-${vIndex}-colorImage-${fIndex}.${
              blob.type.split("/")[1]
            }`;

            return new File([blob], fileName, { type: blob.type });
          })
        );

        // Append color images to FormData
        colorImages.forEach((file) => {
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

    return formData;
  };

  // Memoize variation related props
  const variationProps = useMemo(
    () => ({
      variations: newProduct?.variations,
      handleVariationChange,
      removeVariation,
      removeImage,
      addVariation,
      fileInputRef,
      addSizeToColor,
      removeSizeFromColor,
      handleSizeChange,
      handleSizeImageChange,
      removeSizeImage,
    }),
    [
      newProduct?.variations,
      handleVariationChange,
      removeVariation,
      removeImage,
      addVariation,
      fileInputRef,
      addSizeToColor,
      removeSizeFromColor,
      handleSizeChange,
      handleSizeImageChange,
      removeSizeImage,
    ]
  );

  // Memoize form fields props
  const formFieldsProps = useMemo(
    () => ({
      inputFields,
      fileInputRef,
      handleInputChange,
      handleCategoryChange,
      handleChildCategoryChange,
      handleGrandChildCategoryChange,
    }),
    [
      inputFields,
      fileInputRef,
      handleInputChange,
      handleCategoryChange,
      handleChildCategoryChange,
      handleGrandChildCategoryChange,
    ]
  );

  return (
    <motion.div
      className="bg-gray-800 w-full p-4 rounded-lg md:p-4 mb-8 md:max-w-xl lg:max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductFormFields {...formFieldsProps} />

        <MemoizedProductVariations {...variationProps} />

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

// Memoize ProductVariations to prevent unnecessary re-renders
const MemoizedProductVariations = memo(ProductVariations);

export default CreateProductForm;
