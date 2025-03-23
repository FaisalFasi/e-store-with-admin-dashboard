import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../../../stores/useUserStore";
import { useCartStore } from "../../../stores/useCartStore";
import Navigation from "../../shared/Navigation/Navigation";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Get unique colors across all variations
  const uniqueColors = [
    ...new Set(
      product?.variations?.flatMap((v) => v.colors.map((c) => c.name)) || []
    ),
  ];

  // Get sizes for selected color across all variations
  const sizesForSelectedColor = selectedColor
    ? [
        ...new Set(
          product?.variations?.flatMap((v) =>
            v.colors
              .filter((c) => c.name === selectedColor)
              .flatMap((c) => c.sizes.map((s) => s.value))
          )
        ),
      ]
    : [];

  // Find the full variation details
  const selectedVariation = product?.variations?.find((variation) =>
    variation.colors.some(
      (color) =>
        color.name === selectedColor &&
        color.sizes.some((size) => size.value === selectedSize)
    )
  );

  const selectedColorObj = selectedVariation?.colors?.find(
    (c) => c.name === selectedColor
  );
  const selectedSizeObj = selectedColorObj?.sizes?.find(
    (s) => s.value === selectedSize
  );

  const handleColorChange = (event) => {
    const color = event.target.value;
    setSelectedColor(color);
    setSelectedSize("");
    setSelectedQuantity(1);
  };

  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value >= 0) setSelectedQuantity(value);
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

    // Pass the complete variation structure
    addToCart(product, {
      variation: selectedVariation,
      color: selectedColorObj,
      size: selectedSizeObj,
      quantity: selectedQuantity,
    });
  };

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <Navigation
        to={`/products/${product._id}`}
        className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl hover:scale-105 transition-transform duration-300"
      >
        <img
          className="object-cover w-full"
          src={
            selectedColorObj?.imageUrls?.[0] ||
            product?.variations?.[0]?.colors?.[0]?.imageUrls?.[0] ||
            "https://via.placeholder.com/300"
          }
          alt="product image"
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
              ${selectedSizeObj?.price || product.basePrice}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            In Stock: {selectedSizeObj?.quantity}
          </p>
        </div>

        {/* Color Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">
            Select Color
          </label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-white"
            onChange={handleColorChange}
            value={selectedColor}
          >
            <option value="">Choose a color</option>
            {uniqueColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Size Selection */}
        {selectedColor && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Select Size
            </label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-white"
              onChange={handleSizeChange}
              value={selectedSize}
            >
              <option value="">Choose a size</option>
              {sizesForSelectedColor.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity Input */}
        {selectedSize && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Quantity
            </label>
            <input
              type="number"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-white"
              value={selectedQuantity}
              min="1"
              max={selectedSizeObj?.quantity}
              onChange={handleQuantityChange}
            />
          </div>
        )}

        <button
          className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
       text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize}
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
