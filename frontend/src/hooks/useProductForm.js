// hooks/useProductForm.js
import { useState, useRef, useEffect } from "react";
import { validateImages } from "../utils/imageValidation/imageValidation.js";
import { useCategoryStore } from "../stores/useCategoryStore.js";
import { initializeVariation } from "../helpers/productHelopers/productHelper.js";
import { Construction } from "lucide-react";

export const useProductForm = () => {
  const { categories } = useCategoryStore();

  const initialProductState = {
    name: "",
    description: "",
    category: "",
    subCategory: "",
    grandChildCategory: "",
    status: "draft",
    isFeatured: false,
    variations: [initializeVariation],
  };

  const [newProduct, setNewProduct] = useState(initialProductState);
  const fileInputRef = useRef(null);

  const [categoryData, setCategoryData] = useState({
    selectedCategory: "",
    subCategories: [],
    grandChildCategories: [],
  });

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

  const handleInputChange = (key, value) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

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

  return {
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
    categories,
  };
};
