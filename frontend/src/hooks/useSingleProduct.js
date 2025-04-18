import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getUserData } from "@/utils/getUserData";
import { useCartStore } from "@/stores/useCartStore";
import { useProductStore } from "@/stores/useProductStore";

export const useSingleProduct = () => {
  const { productId } = useParams();
  const {
    fetchProductById,
    fetchRecommendedProducts,
    recommendedProducts,
    products: product,
    loading: isLoading,
  } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = getUserData();

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [selectedQuantity, setSelectedQuantity] = useState(0);

  // Extract unique colors from variations
  const uniqueColors = [
    ...new Set(
      product?.variations?.flatMap((v) =>
        v.colors.map((c) => {
          return {
            color: c.color,
            name: c.colorName,
          };
        })
      ) || []
    ),
  ];

  // Filter sizes based on the selected color
  const sizesForSelectedColor = selectedColor
    ? [
        ...new Set(
          product?.variations?.flatMap((v) =>
            v.colors
              .filter((c) => c.colorName === selectedColor)
              .flatMap((c) => c.sizes.map((s) => s.size))
          )
        ),
      ]
    : [];

  // Find the selected variation based on color and size
  const selectedVariation = product?.variations?.find((variation) =>
    variation?.colors?.some(
      (color) => color.colorName === selectedColor
      // &&
      //   color.sizes.some((size) => size.value === selectedSize)
    )
  );

  const selectedColorObj = selectedVariation?.colors?.find(
    (c) => c.colorName === selectedColor
  );
  const selectedSizeObj = selectedColorObj?.sizes?.find(
    (s) => s.size === selectedSize
  );

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedQuantity(1);

    // Find all size options for this color
    const colorVariations = product?.variations
      ?.flatMap((v) => v.colors.filter((c) => c.colorName === color))
      .flat();
    // Find the first size with available stock (quantity > 0)
    const firstAvailableSize = colorVariations
      ?.flatMap((c) => c.sizes)
      .find((size) => size.quantity > 0)?.size;
    console.log(
      "First available size for color",
      color,
      "is",
      firstAvailableSize
    );

    setSelectedSize(firstAvailableSize || ""); // Fallback to empty if none available

    // Update image to first available variation
    const firstVariationWithStock = product?.variations?.find((v) =>
      v.colors.some(
        (c) => c.colorName === color && c.sizes.some((s) => s.quantity > 0)
      )
    );

    if (firstVariationWithStock) {
      setSelectedImage(firstVariationWithStock.colors[0]?.imageUrls?.[0]);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    // Update images to the selected variation
    const selectedVariation = product?.variations?.find((v) =>
      v.colors.some(
        (c) =>
          c.colorName === selectedColor && c.sizes.some((s) => s.size === size)
      )
    );
    if (selectedVariation) {
      setSelectedImage(selectedVariation.colors[0]?.imageUrls?.[0]);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === "increment" && selectedQuantity < selectedSizeObj?.quantity) {
      setSelectedQuantity((prev) => prev + 1);
    } else if (type === "decrement" && selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error("Please login to add products to wishlist");
      return;
    }
    toast.success("Product added to wishlist!");
  };
  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart");
      return;
    }

    if (!selectedColor || !selectedSize) {
      toast.error("Please select both color and size");
      return;
    }

    if (!selectedSizeObj) {
      toast.error("Selected variation is not available");
      return;
    }

    if (selectedQuantity > selectedSizeObj.quantity) {
      toast.error(`Only ${selectedSizeObj.quantity} items available`);
      return;
    }

    // Add the selected variation and quantity to the cart
    addToCart(product, {
      variation: selectedVariation,
      color: selectedColorObj,
      size: selectedSizeObj,
      quantity: selectedQuantity,
    });
  };

  const setDefaultProductValues = () => {
    if (!product?.variations?.length) return;

    // Try to find first color with available stock
    const initialColorObjWithStock = product.variations
      .flatMap((v) => v.colors)
      .find((c) => c.sizes?.some((s) => s.quantity > 0));

    // Fallback to first color if none have stock
    const initialColorObj =
      initialColorObjWithStock || product.variations[0].colors[0];

    if (initialColorObj) {
      const initialColor = initialColorObj.colorName;

      // Try to find first size with stock, fallback to first size
      const initialSizeWithStock = initialColorObj.sizes?.find(
        (s) => s.quantity > 0
      );

      const initialSize =
        initialSizeWithStock?.size || initialColorObj.sizes[0]?.size || "";

      // Always use first image URL if available
      const initialImage =
        initialColorObj.imageUrls?.[0] ||
        product.variations[0].colors[0]?.imageUrls?.[0] ||
        "";

      setSelectedColor(initialColor);
      setSelectedSize(initialSize);
      setSelectedImage(initialImage);
      setSelectedQuantity(1);
    }
  };
  useEffect(() => {
    fetchProductById(productId);
    fetchRecommendedProducts(productId);
  }, [productId]);

  useEffect(() => {
    if (product?.variations?.length > 0) {
      setDefaultProductValues();
    }
  }, [product]);

  return {
    product,
    recommendedProducts,
    isLoading,
    selectedImage,
    selectedColor,
    selectedSize,
    selectedQuantity,
    uniqueColors,
    sizesForSelectedColor,
    selectedSizeObj,
    handleAddToCart,
    handleColorChange,
    handleSizeChange,
    handleQuantityChange,
    handleAddToWishlist,
    selectedColorObj,
    setSelectedImage,
  };
};
