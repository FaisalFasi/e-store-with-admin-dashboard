import React from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../../../stores/useCartStore";
import { Price } from "@/components/currencyProvider/Price";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();

  // Validate item structure
  if (!item || typeof item !== "object") {
    console.error("Invalid item structure:", item);
    return (
      <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
        <p className="text-red-400">
          Invalid product data. Please remove this item.
        </p>
        <button
          className="inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300 hover:underline"
          onClick={() => removeFromCart(item._id, item.variations[0]._id)}
        >
          <Trash className="mr-2" />
          Remove
        </button>
      </div>
    );
  }

  // Extract nested properties safely
  const variation = item.variations?.[0];
  const color = variation?.colors?.[0];
  const size = color?.sizes?.[0];

  // Handle quantity increase
  const handleIncreaseQuantity = () => {
    if (item?.quantity < item.variations[0]?.colors[0]?.sizes[0]?.quantity) {
      updateQuantity(item._id, item.variations[0]._id, item.quantity + 1);
    }
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.variations[0]._id, item.quantity - 1);
    }
  };

  // Handle remove item
  const handleRemoveItem = () => {
    removeFromCart(item._id, item.variations[0]._id);
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        {/* Product Image */}
        <div className="shrink-0 md:order-1">
          <img
            className="h-20 md:h-32 rounded object-cover"
            src={color?.imageUrls?.[0] || "/placeholder.jpg"}
            alt={item.name}
          />
        </div>

        {/* Quantity Controls and Price */}
        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
               border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2
                focus:ring-emerald-500"
              onClick={handleDecreaseQuantity}
            >
              <Minus className="text-gray-300" />
            </button>
            <p>{item.quantity}</p>
            <button
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
               border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none 
              focus:ring-2 focus:ring-emerald-500"
              onClick={handleIncreaseQuantity}
            >
              <Plus className="text-gray-300" />
            </button>
          </div>

          {/* Price */}
          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-emerald-400">
              <Price
                priceInCents={size?.price?.amount || item.price?.basePrice}
              />
            </p>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          {/* Product Name */}
          <p className="text-base font-medium text-white hover:text-emerald-400 hover:underline">
            {item.name}
          </p>

          {/* Selected Variation Details */}
          <div className="text-sm text-gray-400">
            <p>Color: {color?.colorName}</p>
            <p>Size: {size?.size}</p>
          </div>

          {/* Remove Button */}
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center text-sm font-medium text-red-400
               hover:text-red-300 hover:underline"
              onClick={handleRemoveItem}
            >
              <Trash className="mr-2" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
