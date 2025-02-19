import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../../../stores/useUserStore";
import { useCartStore } from "../../../stores/useCartStore";
import Navigation from "../../shared/Navigation/Navigation";

const ProductCard = ({ product, index }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const [selectedVariation, setSelectedVariation] = useState({
    _id: "",
    size: "",
    color: "",
    quantity: 1,
    price: 0,
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }

    if (!selectedVariation.size || !selectedVariation.color) {
      toast.error("Please select both size and color before adding to cart", {
        id: "variation",
      });
      return;
    }

    const _selectedVariation = product.variations.find(
      (variation) =>
        variation.size === selectedVariation.size &&
        variation.color === selectedVariation.color
    );

    if (!_selectedVariation) {
      toast.error("Selected variation is not available", { id: "variation" });
      return;
    }

    if (selectedVariation.quantity > _selectedVariation.quantity) {
      toast.error(
        `Only ${_selectedVariation.quantity} items available in stock`,
        { id: "quantity" }
      );
      return;
    }

    // Add the selected variation and quantity to the cart
    addToCart(product, {
      ..._selectedVariation,
      _id: _selectedVariation._id,
      quantity: selectedVariation.quantity,
      price: _selectedVariation.price,
    });

    toast.success("Product added to cart!");
  };

  console.log("Selected Variation:", selectedVariation);
  const handleSizeChange = (event) => {
    setSelectedVariation({
      ...selectedVariation,
      size: event.target.value,
    });

    // setSelectedSize(event.target.value);
  };

  const handleColorChange = (event) => {
    setSelectedVariation({
      ...selectedVariation,
      color: event.target.value,
    });
    // setSelectedColor(event.target.value);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setSelectedVariation({
        ...selectedVariation,
        quantity: value,
      });
      // setQuantity(value);
    }
  };
  console.log("Product card---:", product);

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
              ${product?.defaultVariation?.price}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            In Stock: {product?.defaultVariation?.quantity}
          </p>
        </div>

        {/* Size Selection Dropdown */}
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
            value={selectedVariation.size}
          >
            <option value="">Choose a size</option>
            {product?.variations?.map((variation, i) => (
              <option key={i} value={variation?.size}>
                {variation?.size}
              </option>
            ))}
          </select>
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
            value={selectedVariation.color}
          >
            <option value="">Choose a color</option>
            {product?.variations?.map((variation, i) => (
              <option key={i} value={variation?.color}>
                {variation?.color}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
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
            value={selectedVariation?.quantity}
            min="1"
            onChange={handleQuantityChange}
          />
        </div>

        {/* Add to Cart Button */}
        <button
          className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
       text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={!selectedVariation.size || !selectedVariation.color}
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
