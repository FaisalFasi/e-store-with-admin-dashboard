// hooks/useProductForm.js
import { useState, useRef, useEffect } from "react";
import { validateImages } from "../utils/imageValidation/imageValidation.js";
import { useCategoryStore } from "../stores/useCategoryStore.js";
import { initializeVariation } from "../helpers/productHelopers/productHelper.js";
import { Construction } from "lucide-react";

export const useProductForm = () => {
  const { categories } = useCategoryStore();

  const fileInputRef = useRef(null);

  const [categoryData, setCategoryData] = useState({
    selectedCategory: "",
    subCategories: [],
    grandChildCategories: [],
  });

  const initialProductState = {
    name: "",
    description: "",
    category: {
      parent: "",
      child: null,
      grandchild: null,
    },
    basePrice: 0,
    stock: 0,
    tags: [],
    status: "draft",
    isFeatured: false,
    variations: [
      {
        colorName: "",
        colorImages: [],
        sizes: [
          {
            value: "",
            price: 0,
            quantity: 0,
            images: [],
          },
        ],
      },
    ],
  };
  const [newProduct, setNewProduct] = useState(initialProductState);

  const handleInputChange = (key, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [key]: key === "tags" ? (Array.isArray(value) ? value : [value]) : value,
    }));
  };

  const handleSizeChange = (vIndex, sIndex, field, value) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].sizes[sIndex][field] = value;
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };
  const addSizeToColor = (vIndex) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].sizes.push({
      value: "",
      price: 0,
      quantity: 0,
      images: [],
    });
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  const removeSizeFromColor = (vIndex, sIndex) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].sizes = updatedVariations[vIndex].sizes.filter(
      (_, i) => i !== sIndex
    );
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };
  const handleVariationChange = (vIndex, type, files) => {
    const updatedVariations = [...newProduct.variations];

    if (type === "colorImages") {
      updatedVariations[vIndex].colorImages = [
        ...updatedVariations[vIndex].colorImages,
        ...validateImages(files),
      ];
    } else {
      updatedVariations[vIndex][type] = files;
    }

    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  useEffect(() => {
    if (categories.length > 0) {
      const defaultCategory = categories[0];
      const defaultSubCategory = defaultCategory.subCategories?.[0];
      const defaultGrandChildCategory =
        defaultSubCategory?.subCategories?.[0]?._id || "";

      setNewProduct((prev) => ({
        ...prev,
        category: defaultCategory._id,
        subCategory: defaultSubCategory?._id || "",
        grandChildCategory: defaultGrandChildCategory,
      }));

      setCategoryData({
        selectedCategory: defaultCategory._id,
        subCategories: defaultCategory.subCategories || [],
        selectedChildCategory: defaultSubCategory?._id || "",
        grandChildCategories: defaultSubCategory?.subCategories || [],
      });
    }
  }, [categories]);

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;

    const selectedCategory = categories.find(
      (cat) => cat._id === selectedCategoryId
    );
    setCategoryData({
      selectedCategory: selectedCategoryId,
      subCategories: selectedCategory ? selectedCategory.subCategories : [],
      selectedChildCategory: "",
      grandChildCategories: [],
    });

    setNewProduct((prev) => ({
      ...prev,
      category: selectedCategoryId,
      subCategory: "",
      grandChildCategory: "",
    }));
  };

  const handleChildCategoryChange = (e) => {
    const selectedChildCategoryId = e.target.value;
    const selectedChildCategory = categoryData.subCategories.find(
      (subCat) => subCat._id === selectedChildCategoryId
    );

    setCategoryData((prev) => ({
      ...prev,
      selectedChildCategory: selectedChildCategoryId,
      grandChildCategories: selectedChildCategory
        ? selectedChildCategory.subCategories
        : [],
    }));

    setNewProduct((prev) => ({
      ...prev,
      subCategory: selectedChildCategoryId,
      grandChildCategory: selectedChildCategory?.subCategories?.[0]?._id || "",
    }));
  };

  const handleGrandChildCategoryChange = (e) => {
    const selectedGrandChildCategoryId = e.target.value;
    setNewProduct((prev) => ({
      ...prev,
      grandChildCategory: selectedGrandChildCategoryId,
    }));
  };

  const addVariation = (e) => {
    e.preventDefault();
    setNewProduct({
      ...newProduct,
      variations: [
        ...newProduct.variations,
        {
          colorName: "",
          colorImages: [],
          sizes: [
            {
              value: "",
              price: 0,
              quantity: 0,
              images: [],
            },
          ],
        },
      ],
    });
  };

  const removeVariation = (index) => {
    if (index === 0) return; // Prevent removing first variation
    const updatedVariations = newProduct.variations.filter(
      (_, i) => i !== index
    );
    setNewProduct({
      ...newProduct,
      variations: updatedVariations,
    });
  };

  const handleSizeImageChange = (vIndex, sIndex, files) => {
    const updatedVariations = [...newProduct.variations];
    const validatedImages = validateImages(files);
    updatedVariations[vIndex].sizes[sIndex].images = [
      ...updatedVariations[vIndex].sizes[sIndex].images,
      ...validatedImages,
    ];
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  // In useProductForm.js - Update image removal functions
  const removeImage = (vIndex, imageIndex) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].colorImages = updatedVariations[
      vIndex
    ].colorImages.filter((_, i) => i !== imageIndex);
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  const removeSizeImage = (vIndex, sIndex, imageIndex) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].sizes[sIndex].images = updatedVariations[
      vIndex
    ].sizes[sIndex].images.filter((_, i) => i !== imageIndex);
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  return {
    newProduct,
    setNewProduct,
    initialProductState,
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
    categories,
    handleSizeChange,
    addSizeToColor,
    removeSizeFromColor,
    handleSizeImageChange,
    removeSizeImage,
  };
};
