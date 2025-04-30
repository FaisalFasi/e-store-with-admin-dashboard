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

  const [newProduct, setNewProduct] = useState({
    ...initialProductState,
    price: {
      basePrice: 0,
      currency: "USD",
    },
  });

  // Initialize categories when component loads
  useEffect(() => {
    if (categories.length > 0) {
      // Filter level 1 categories (depth = 0, no parent)
      const l1Categories = categories.filter(
        (cat) => cat.depth === 0 && cat.status === "active"
      );

      setCategoryData((prev) => ({
        ...prev,
        l1: l1Categories,
      }));

      // Set default L1 category if none is selected
      if (!newProduct.category.l1 && l1Categories.length > 0) {
        const defaultL1 = l1Categories[0]._id;
        handleCategoryChange({ target: { value: defaultL1 } });
      }
    }
  }, [categories]);

  // Generic category change handler
  // Handle main category (L1) change
  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;

    // Find L2 categories that have this L1 as parent
    const l2Categories = categories.filter(
      (cat) =>
        cat.depth === 1 &&
        cat.parentCategory === selectedCategoryId &&
        cat.status === "active"
    );

    // Update category data state
    setCategoryData((prev) => ({
      ...prev,
      l2: l2Categories,
      l3: [], // Reset deeper levels
      l4: [],
    }));

    // Update product state
    setNewProduct((prev) => ({
      ...prev,
      category: {
        l1: selectedCategoryId,
        l2: l2Categories.length > 0 ? l2Categories[0]._id : "",
        l3: "",
        l4: "",
      },
    }));

    // If L2 categories exist, trigger L2 change with the first one
    if (l2Categories.length > 0) {
      setTimeout(() => {
        handleChildCategoryChange({ target: { value: l2Categories[0]._id } });
      }, 0);
    }
  };

  // Handle L2 category change
  const handleChildCategoryChange = (e) => {
    const selectedL2Id = e.target.value;

    // Find L3 categories that have this L2 as parent
    const l3Categories = categories.filter(
      (cat) =>
        cat.depth === 2 &&
        cat.parentCategory === selectedL2Id &&
        cat.status === "active"
    );

    // Update category data state
    setCategoryData((prev) => ({
      ...prev,
      l3: l3Categories,
      l4: [], // Reset L4
    }));

    // Update product state
    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l2: selectedL2Id,
        l3: l3Categories.length > 0 ? l3Categories[0]._id : "",
        l4: "",
      },
    }));

    // If L3 categories exist, trigger L3 change with the first one
    if (l3Categories.length > 0) {
      setTimeout(() => {
        handleGrandChildCategoryChange({
          target: { value: l3Categories[0]._id },
        });
      }, 0);
    }
  };

  // Handle L3 category change
  const handleGrandChildCategoryChange = (e) => {
    const selectedL3Id = e.target.value;

    // Find L4 categories that have this L3 as parent
    const l4Categories = categories.filter(
      (cat) =>
        cat.depth === 3 &&
        cat.parentCategory === selectedL3Id &&
        cat.status === "active"
    );

    // Update category data state
    setCategoryData((prev) => ({
      ...prev,
      l4: l4Categories,
    }));

    // Update product state
    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l3: selectedL3Id,
        l4: l4Categories.length > 0 ? l4Categories[0]._id : "",
      },
    }));

    // If L4 categories exist, trigger L4 change with the first one
    if (l4Categories.length > 0) {
      setTimeout(() => {
        handleGreatGrandChildCategoryChange({
          target: { value: l4Categories[0]._id },
        });
      }, 0);
    }
  };

  // Handle L4 category change
  const handleGreatGrandChildCategoryChange = (e) => {
    const selectedL4Id = e.target.value;

    // Update product state
    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l4: selectedL4Id,
      },
    }));
  };
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
                currency: newProduct.price.currency || "USD",
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

    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  const addSizeToColor = (vIndex) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[vIndex].sizes.push({
      size: "",
      price: { amount: 0, currency: newProduct.price.currency || "USD" },
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
