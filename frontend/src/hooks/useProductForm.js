import { useState, useRef, useEffect } from "react";
import { validateImages } from "../utils/imageValidation/imageValidation.js";
import { useCategoryStore } from "../stores/useCategoryStore.js";
import { initialProductState } from "../helpers/productHelopers/productHelper.js";

export const useProductForm = () => {
  const { categories } = useCategoryStore();
  const fileInputRef = useRef(null);

  const [categoryData, setCategoryData] = useState({
    l1: [], // Level 1 categories (main categories)
    l2: [], // Level 2 subcategories
    l3: [], // Level 3 grandchild categories
    l4: [], // Level 4 great-grandchild categories
  });
  console.log("Category data:", categories);

  const [newProduct, setNewProduct] = useState({
    ...initialProductState,
    pricing: {
      basePrice: 0,
      currency: "USD",
    },
  });

  // Handle input changes for both top-level and nested fields
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      // Handle nested fields (e.g., 'pricing.basePrice')
      const [parent, child] = field.split(".");
      setNewProduct((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setNewProduct((prev) => ({
        ...prev,
        [field]:
          field === "tags" ? (Array.isArray(value) ? value : [value]) : value,
      }));
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      // Get all root categories (depth 0)
      const rootCategories = categories.filter((cat) => cat.depth === 0);
      const firstRootCategory = rootCategories[0];

      // Get all immediate subcategories for L1
      const l2Categories = firstRootCategory?.subCategories || [];

      // Get all nested subcategories for L3 and L4
      const l3Categories = l2Categories.flatMap((l2) => l2.subCategories || []);
      const l4Categories = l3Categories.flatMap((l3) => l3.subCategories || []);

      setCategoryData({
        l1: rootCategories, // All root categories
        l2: l2Categories, // All direct subcategories of first root
        l3: l3Categories, // All grandchild categories
        l4: l4Categories, // All great-grandchild categories
      });

      setNewProduct((prev) => ({
        ...prev,
        category: {
          l1: firstRootCategory._id,
          l2: l2Categories[0]?._id || "",
          l3: l3Categories[0]?._id || "",
          l4: l4Categories[0]?._id || "",
        },
      }));
    }
  }, [categories]);

  // Updated category change handler
  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    const selectedL1 = categories.find((cat) => cat._id === selectedCategoryId);

    const l2Categories = selectedL1?.subCategories || [];
    const l3Categories = l2Categories.flatMap((l2) => l2.subCategories || []);
    const l4Categories = l3Categories.flatMap((l3) => l3.subCategories || []);

    setCategoryData((prev) => ({
      ...prev,
      l2: l2Categories,
      l3: l3Categories,
      l4: l4Categories,
    }));

    setNewProduct((prev) => ({
      ...prev,
      category: {
        l1: selectedCategoryId,
        l2: l2Categories[0]?._id || "",
        l3: l3Categories[0]?._id || "",
        l4: l4Categories[0]?._id || "",
      },
    }));
  };

  // Updated child category handler
  const handleChildCategoryChange = (e) => {
    const l2Id = e.target.value;
    const selectedL2 = categoryData.l2.find((cat) => cat._id === l2Id);

    const l3Categories = selectedL2?.subCategories || [];
    const l4Categories = l3Categories.flatMap((l3) => l3.subCategories || []);

    setCategoryData((prev) => ({
      ...prev,
      l3: l3Categories,
      l4: l4Categories,
    }));

    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l2: l2Id,
        l3: l3Categories[0]?._id || "",
        l4: l4Categories[0]?._id || "",
      },
    }));
  };

  // Updated grandchild category handler
  const handleGrandChildCategoryChange = (e) => {
    const l3Id = e.target.value;
    const selectedL3 = categoryData.l3.find((cat) => cat._id === l3Id);

    const l4Categories = selectedL3?.subCategories || [];

    setCategoryData((prev) => ({
      ...prev,
      l4: l4Categories,
    }));

    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l3: l3Id,
        l4: l4Categories[0]?._id || "",
      },
    }));
  };

  // Keep the existing handleGreatGrandChildCategoryChange
  const handleGreatGrandChildCategoryChange = (e) => {
    const l4Id = e.target.value;

    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l4: l4Id,
      },
    }));
  };

  // Variation handlers
  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...newProduct.variations];

    if (field === "colorImages") {
      const validatedImages = validateImages(value);
      updatedVariations[index].colorImages = [
        ...updatedVariations[index].colorImages,
        ...validatedImages,
      ];
    } else {
      updatedVariations[index][field] = value;
    }

    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  const addVariation = (e) => {
    e.preventDefault();
    setNewProduct({
      ...newProduct,
      variations: [
        ...newProduct.variations,
        {
          color: "",
          colorName: "",
          colorImages: [],
          sizes: [
            {
              size: "",
              price: {
                amount: 0,
                currency: newProduct.pricing.currency || "USD",
              },
              quantity: 0,
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

  // Size handlers
  const handleSizeChange = (vIndex, sIndex, field, value) => {
    const updatedVariations = [...newProduct.variations];

    if (field === "price") {
      const amount = typeof value === "object" ? value.amount : value;

      updatedVariations[vIndex].sizes[sIndex].price = {
        ...updatedVariations[vIndex].sizes[sIndex].price,
        amount: Number(amount) || 0,
      };
    } else {
      updatedVariations[vIndex].sizes[sIndex][field] = value;
    }
    console.log("Updated variations after size change:", updatedVariations);
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  const addSizeToColor = (vIndex) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].sizes.push({
      size: "",
      price: { amount: 0, currency: newProduct.pricing.currency || "USD" },
      quantity: 0,
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

  // Image handlers
  const handleSizeImageChange = (vIndex, sIndex, files) => {
    const updatedVariations = [...newProduct.variations];
    const validatedImages = validateImages(files);
    updatedVariations[vIndex].sizes[sIndex].images = [
      ...updatedVariations[vIndex].sizes[sIndex].images,
      ...validatedImages,
    ];
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

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
  };
};
