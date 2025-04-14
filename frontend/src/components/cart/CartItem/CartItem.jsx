import React, { useCallback, memo } from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { Price } from "@/components/currencyProvider/Price";

const CartItem = memo(({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();

  // Safely extract nested properties with fallbacks
  const variation = item.variations?.[0] || {};
  const color = variation.colors?.[0] || {};
  const size = color.sizes?.[0] || {};
  const maxQuantity = size.quantity || 1;
  const imageUrl = color.imageUrls?.[0] || "/placeholder.jpg";
  const price = size.price?.amount || item.price?.basePrice;

  // Memoized handlers to prevent unnecessary re-renders
  const handleIncreaseQuantity = useCallback(() => {
    if (item.quantity < maxQuantity) {
      updateQuantity(item._id, variation._id, item.quantity + 1);
    }
  }, [item.quantity, maxQuantity, item._id, variation._id, updateQuantity]);

  const handleDecreaseQuantity = useCallback(() => {
    if (item.quantity > 1) {
      updateQuantity(item._id, variation._id, item.quantity - 1);
    }
  }, [item.quantity, item._id, variation._id, updateQuantity]);

  const handleRemoveItem = useCallback(() => {
    removeFromCart(item._id, variation._id);
  }, [item._id, variation._id, removeFromCart]);

  // Early return for invalid items
  if (!item || typeof item !== "object" || !item._id) {
    return (
      <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
        <p className="text-red-400">
          Invalid product data. Please remove this item.
        </p>
        <button
          className="inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300 hover:underline"
          onClick={handleRemoveItem}
        >
          <Trash className="mr-2" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        {/* Product Image - Lazy loading and fixed dimensions */}
        <div className="shrink-0 md:order-1">
          <img
            className="h-20 w-20 md:h-32 md:w-32 rounded object-cover"
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            width={128}
            height={128}
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
              aria-label="Decrease quantity"
            >
              <Minus className="text-gray-300" size={14} />
            </button>
            <span className="min-w-[20px] text-center">{item.quantity}</span>
            <button
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
               border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none 
              focus:ring-2 focus:ring-emerald-500"
              onClick={handleIncreaseQuantity}
              aria-label="Increase quantity"
              disabled={item.quantity >= maxQuantity}
            >
              <Plus className="text-gray-300" size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-emerald-400">
              <Price priceInCents={price} />
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
            <p>Color: {color.colorName || "N/A"}</p>
            <p>Size: {size.size || "N/A"}</p>
          </div>

          {/* Remove Button */}
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center text-sm font-medium text-red-400
               hover:text-red-300 hover:underline"
              onClick={handleRemoveItem}
            >
              <Trash className="mr-2" size={14} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem"; // Required for React DevTools when using memo
export default CartItem;
