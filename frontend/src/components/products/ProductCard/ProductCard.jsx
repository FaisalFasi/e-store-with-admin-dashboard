import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../../../stores/useUserStore";
import { useCartStore } from "../../../stores/useCartStore";
import Navigation from "../../shared/Navigation/Navigation";

const ProductCard = ({ product, index }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Extract unique colors from variations
  const uniqueColors = [
    ...new Set(product?.variations?.map((v) => v.color) || []),
  ];

  // Filter sizes based on the selected color
  const sizesForSelectedColor = selectedColor
    ? [
        ...new Set(
          product.variations
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size)
        ),
      ]
    : [];

  // Find the selected variation based on color and size
  const selectedVariationDetails = product?.variations?.find(
    (variation) =>
      variation.color === selectedColor && variation.size === selectedSize
  );

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }

    if (!selectedColor || !selectedSize) {
      toast.error("Please select both color and size before adding to cart", {
        id: "variation",
      });
      return;
    }

    if (!selectedVariationDetails) {
      toast.error("Selected variation is not available", { id: "variation" });
      return;
    }

    if (selectedQuantity > selectedVariationDetails.quantity) {
      toast.error(
        `Only ${selectedVariationDetails.quantity} items available in stock`,
        { id: "quantity" }
      );
      return;
    }

    // Add the selected variation and quantity to the cart
    addToCart(product, {
      ...selectedVariationDetails,
      quantity: selectedQuantity,
    });
  };

  const handleColorChange = (event) => {
    const color = event.target.value;
    setSelectedColor(color);
    setSelectedSize(""); // Reset size when color changes
    setSelectedQuantity(1); // Reset quantity when color changes
  };

  const handleSizeChange = (event) => {
    const size = event.target.value;
    setSelectedSize(size);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setSelectedQuantity(value);
    }
  };

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <Navigation
        to={`/products/${product._id}`}
        className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl hover:scale-105 transition-transform duration-300"
      >
        <img
          className="object-cover w-full"
          src={product?.defaultVariation?.imageUrls[0]}
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
              $
              {selectedVariationDetails?.price ||
                product?.defaultVariation?.price}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            In Stock:{" "}
            {selectedVariationDetails?.quantity ||
              product?.defaultVariation?.quantity}
          </p>
        </div>

        {/* Color Selection Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-300"
          >
            Select Color
          </label>
          <select
            id="color"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-white"
            onChange={handleColorChange}
            value={selectedColor}
          >
            <option value="">Choose a color</option>
            {uniqueColors.map((color, i) => (
              <option key={i} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Size Selection Dropdown (only shown if a color is selected) */}
        {selectedColor && (
          <div className="mb-4">
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-300"
            >
              Select Size
            </label>
            <select
              id="size"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-white"
              onChange={handleSizeChange}
              value={selectedSize}
            >
              <option value="">Choose a size</option>
              {sizesForSelectedColor.map((size, i) => (
                <option key={i} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity Input (only shown if a size is selected) */}
        {selectedSize && (
          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-300"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-white"
              value={selectedQuantity}
              min="1"
              max={selectedVariationDetails?.quantity}
              onChange={handleQuantityChange}
            />
          </div>
        )}

        {/* Add to Cart Button */}
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
