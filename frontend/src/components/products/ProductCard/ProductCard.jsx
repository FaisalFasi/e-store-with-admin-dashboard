import React, { useMemo, useCallback, useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../../../stores/useUserStore";
import { useCartStore } from "../../../stores/useCartStore";
import Navigation from "../../shared/Navigation/Navigation";
import Select from "@/components/shared/Select/Select";
import InputField from "@/components/shared/InputField/InputField";
import { usePrice } from "@/utils/currency/currency.js";

const ProductCard = React.memo(({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { formatPrice } = usePrice();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Memoize derived data to avoid recalculating on every render
  const { uniqueColors, variations } = useMemo(() => {
    const variations = product?.variations || [];
    const colors = variations.flatMap((v) => v.colors.map((c) => c.colorName));
    return {
      uniqueColors: [...new Set(colors)],
      variations,
    };
  }, [product]);

  // Memoize sizes for selected color
  const sizesForSelectedColor = useMemo(() => {
    if (!selectedColor) return [];
    return [
      ...new Set(
        variations.flatMap((v) =>
          v.colors
            .filter((c) => c.colorName === selectedColor)
            .flatMap((c) => c.sizes.map((s) => s.size))
        )
      ),
    ];
  }, [selectedColor, variations]);

  // Find the full variation details
  const { selectedVariation, selectedColorObj, selectedSizeObj } =
    useMemo(() => {
      if (!selectedColor || !selectedSize) return {};

      const variation = variations.find((v) =>
        v.colors.some(
          (c) =>
            c.colorName === selectedColor &&
            c.sizes.some((s) => s.size === selectedSize)
        )
      );

      const colorObj = variation?.colors?.find(
        (c) => c.colorName === selectedColor
      );
      const sizeObj = colorObj?.sizes?.find((s) => s.size === selectedSize);

      return {
        selectedVariation: variation,
        selectedColorObj: colorObj,
        selectedSizeObj: sizeObj,
      };
    }, [selectedColor, selectedSize, variations]);

  // Reset quantity when size changes
  useEffect(() => {
    setSelectedQuantity(1);
  }, [selectedSize]);

  // Event handlers with useCallback
  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    setSelectedSize("");
  }, []);

  const handleSizeChange = useCallback((value) => {
    setSelectedSize(value);
  }, []);

  const handleQuantityChange = useCallback(
    (event) => {
      const value = parseInt(event.target.value, 10);
      if (
        !isNaN(value) &&
        value >= 1 &&
        value <= (selectedSizeObj?.quantity || 1)
      ) {
        setSelectedQuantity(value);
      }
    },
    [selectedSizeObj?.quantity]
  );

  const handleAddToCart = useCallback(() => {
    // if (!user) {
    //   toast.error("Please login to add products to cart");
    //   return;
    // }

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

    addToCart(product, {
      variation: selectedVariation,
      color: selectedColorObj,
      size: selectedSizeObj,
      quantity: selectedQuantity,
    });
  }, [
    user,
    selectedColor,
    selectedSize,
    selectedSizeObj,
    selectedQuantity,
    addToCart,
    product,
    selectedVariation,
    selectedColorObj,
  ]);

  // Get default image URL
  const imageUrl = useMemo(() => {
    return (
      selectedColorObj?.imageUrls?.[0] ||
      variations?.[0]?.colors?.[0]?.imageUrls?.[0] ||
      "https://via.placeholder.com/300"
    );
  }, [selectedColorObj, variations]);

  return (
    <div className="flex w-full relative flex-col overflow-visible rounded-lg border border-gray-700 shadow-lg">
      <Navigation
        to={`/products/${product._id}`}
        className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl hover:scale-105 transition-transform duration-300"
      >
        <img
          className="object-cover w-full"
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          width={300}
          height={300}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </Navigation>

      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product.name}
        </h5>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-emerald-400">
              {formatPrice(
                selectedSizeObj?.price?.amount || product?.price?.basePrice
              )}
            </span>
          </p>
          {selectedSizeObj?.quantity >= 0 && (
            <p className="text-sm text-gray-400">
              In Stock: {selectedSizeObj?.quantity}
            </p>
          )}
        </div>

        {/* Color Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">
            Select Color
          </label>
          <Select
            options={uniqueColors}
            selectedOption={selectedColor}
            onChange={handleColorChange}
            isColor={true}
          />
        </div>

        {/* Size Selection */}
        {selectedColor && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Select Size
            </label>
            <Select
              options={sizesForSelectedColor}
              selectedOption={selectedSize}
              onChange={handleSizeChange}
            />
          </div>
        )}

        {/* Quantity Input */}
        {selectedSize && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Quantity
            </label>
            <InputField
              type="number"
              value={selectedQuantity}
              min="1"
              max={selectedSizeObj?.quantity}
              onChange={handleQuantityChange}
            />
          </div>
        )}

        <button
          className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
       text-white hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize}
          aria-label="Add to cart"
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
