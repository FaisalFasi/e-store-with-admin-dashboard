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
    selected: {
      l1: "",
      l2: "",
      l3: "",
      l4: "",
    },
  });
  console.log("Category data:", categories);

  const [newProduct, setNewProduct] = useState({
    ...initialProductState,
    pricing: {
      basePrice: 0,
      currency: "USD",
    },
    category: {
      l1: "",
      l2: "",
      l3: "",
      l4: "",
    },

    variations: [
      {
        color: "",
        colorName: "",
        colorImages: [],
        sizes: [
          {
            size: "",
            price: { amount: 0, currency: "USD" },
            quantity: 0,
          },
        ],
      },
    ],
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

  // Initialize form with default categories when categories load
  useEffect(() => {
    if (categories.length > 0) {
      console.log("All categories:", categories);

      // Find L1 categories (depth === 0)
      const l1Categories = categories.filter((cat) => cat.depth === 0);
      const defaultL1 = l1Categories[0]?._id || "";

      // Find L2 categories (direct subCategories of defaultL1)
      const defaultL1Category = l1Categories[0];
      const l2Categories = defaultL1Category?.subCategories || [];
      const defaultL2 = l2Categories[0]?._id || "";

      // Find L3 categories (subCategories of default L2)
      const defaultL2Category = l2Categories[0];
      const l3Categories = defaultL2Category?.subCategories || [];
      const defaultL3 = l3Categories[0]?._id || "";

      // Find L4 categories (subCategories of default L3)
      const defaultL3Category = l3Categories[0];
      const l4Categories = defaultL3Category?.subCategories || [];
      const defaultL4 = l4Categories[0]?._id || "";

      console.log("Initial category setup:", {
        l1: l1Categories,
        l2: l2Categories,
        l3: l3Categories,
        l4: l4Categories,
      });

      setCategoryData({
        l1: l1Categories,
        l2: l2Categories,
        l3: l3Categories,
        l4: l4Categories,
        selected: {
          l1: defaultL1,
          l2: defaultL2,
          l3: defaultL3,
          l4: defaultL4,
        },
      });

      setNewProduct((prev) => ({
        ...prev,
        category: {
          l1: defaultL1,
          l2: defaultL2,
          l3: defaultL3,
          l4: defaultL4,
        },
      }));
    }
  }, [categories]);
  // Category change handlers
  const handleCategoryChange = async (e) => {
    const l1Id = e.target.value;
    const selectedL1 = categories.find((cat) => cat._id === l1Id);
    const l2Categories = selectedL1?.subCategories || [];

    setCategoryData((prev) => ({
      ...prev,
      l2: l2Categories,
      l3: [],
      l4: [],
      selected: {
        l1: l1Id,
        l2: l2Categories[0]?._id || "",
        l3: "",
        l4: "",
      },
    }));

    setNewProduct((prev) => ({
      ...prev,
      category: {
        l1: l1Id,
        l2: l2Categories[0]?._id || "",
        l3: "",
        l4: "",
      },
    }));
  };

  const handleChildCategoryChange = async (e) => {
    const l2Id = e.target.value;
    const selectedL1 = categories.find((cat) =>
      cat.subCategories?.some((sub) => sub._id === l2Id)
    );
    const selectedL2 = selectedL1?.subCategories?.find(
      (cat) => cat._id === l2Id
    );
    const l3Categories = selectedL2?.subCategories || [];

    setCategoryData((prev) => ({
      ...prev,
      l3: l3Categories,
      l4: [],
      selected: {
        ...prev.selected,
        l2: l2Id,
        l3: l3Categories[0]?._id || "",
        l4: "",
      },
    }));

    setNewProduct((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        l2: l2Id,
        l3: l3Categories[0]?._id || "",
        l4: "",
      },
    }));
  };

  const handleGrandChildCategoryChange = async (e) => {
    const l3Id = e.target.value;

    // Find the parent L2 category that contains this L3
    const selectedL1 = categories.find((cat) =>
      cat.subCategories?.some((l2) =>
        l2.subCategories?.some((l3) => l3._id === l3Id)
      )
    );

    const selectedL2 = selectedL1?.subCategories?.find((l2) =>
      l2.subCategories?.some((l3) => l3._id === l3Id)
    );

    const selectedL3 = selectedL2?.subCategories?.find((l3) => l3._id === l3Id);
    const l4Categories = selectedL3?.subCategories || [];

    setCategoryData((prev) => ({
      ...prev,
      l4: l4Categories,
      selected: {
        ...prev.selected,
        l3: l3Id,
        l4: l4Categories[0]?._id || "",
      },
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

  const handleGreatGrandChildCategoryChange = (e) => {
    const l4Id = e.target.value;

    setCategoryData((prev) => ({
      ...prev,
      selected: {
        ...prev.selected,
        l4: l4Id,
      },
    }));

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
