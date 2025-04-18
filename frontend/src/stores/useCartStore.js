import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";
import { keyframes } from "framer-motion";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      coupon: null,
      total: 0,
      subTotal: 0,
      loading: false,
      isCouponApplied: false,
      savings: 0,

      // Fetch the user's active coupon
      getMyCoupon: async () => {
        set({ loading: true });
        try {
          const response = await axiosBaseURL.get("/coupons");
          const coupon = response?.data;

          if (!coupon) {
            toast.error("No active coupon found");
            return;
          }

          // Check if the coupon is expired
          if (new Date(coupon.expirationDate) < new Date()) {
            toast.error("Coupon has expired");
            return;
          }

          // Set the coupon in the state
          set({ coupon });
          toast.success("Coupon fetched successfully");
        } catch (error) {
          console.error("Error fetching coupon:", error);
          toast.error("Failed to fetch coupon");
        } finally {
          set({ loading: false });
        }
      },

      // Apply a coupon by code
      applyCoupon: async (code) => {
        set({ loading: true });
        try {
          const { isCouponApplied } = get();

          // Check if a coupon is already applied
          if (isCouponApplied) {
            toast.error("A coupon is already applied");
            return;
          }

          // Validate and apply the coupon
          const response = await axiosBaseURL.post("/coupons/validate", {
            code,
          });
          const coupon = response?.data;

          if (!coupon) {
            toast.error("Invalid coupon code");
            return;
          }

          // Check if the coupon is expired
          if (new Date(coupon.expirationDate) < new Date()) {
            toast.error("Coupon has expired");
            return;
          }

          // Set the coupon and mark it as applied
          set({ coupon, isCouponApplied: true });

          // Recalculate the total amount in the cart
          get().calculate_Total_AmountInCart();

          toast.success("Coupon applied successfully");
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to apply coupon"
          );
        } finally {
          set({ loading: false });
        }
      },

      removeCoupon: () => {
        const { isCouponApplied } = get();

        // Check if a coupon is applied
        if (!isCouponApplied) {
          toast.error("No coupon is applied");
          return;
        }

        // Remove the coupon and mark it as not applied
        set({ coupon: null, isCouponApplied: false });

        // Recalculate the total amount in the cart
        get().calculate_Total_AmountInCart();

        toast.success("Coupon removed");
      },

      getCartItems: async () => {
        set({ loading: true });

        try {
          const response = await axiosBaseURL.get("/cart");
          console.log("Response from getCartItems:", response);
          const { cartItems } = response?.data || {}; // Destructure cartItems

          console.log("Cart items:", cartItems);

          set({
            cart: cartItems || [], // Fallback to an empty array if cartItems is undefined
            loading: false,
          });

          get().calculate_Total_AmountInCart(); // Use consistent naming
        } catch (error) {
          console.error("Error in getCartItems:", error); // Log the error for debugging
          set({
            cart: [],
            total: 0,
            subTotal: 0,
            loading: false,
          });

          // Provide a more detailed error message
          toast.error("Failed to load cart items. Please try again later.");
        }
      },

      addToCart: async (product, selectedVariation) => {
        try {
          // Validate inputs
          if (
            !product ||
            !selectedVariation?.variation ||
            !selectedVariation?.color ||
            !selectedVariation?.size
          ) {
            toast.error("Invalid product data. Please try again.");
            return;
          }

          // Destructure the selected variation details
          const {
            variation: selectedVar,
            color: selectedColor,
            size: selectedSize,
            quantity,
          } = selectedVariation;
          const sizeValue = selectedSize.size;
          const colorName = selectedColor.colorName;
          const variationId = selectedVar._id;

          // Find the matching product variation
          const productVariation = product.variations.find(
            (v) => v._id === variationId
          );
          if (!productVariation) {
            toast.error("Selected variation not found in product");
            return;
          }

          // Find matching color in the variation
          const colorObj = productVariation.colors.find(
            (c) => c.colorName === colorName
          );
          if (!colorObj) {
            toast.error("Selected color not found in variation");
            return;
          }

          // Find matching size in the color
          const sizeObj = colorObj.sizes.find((s) => s.size === sizeValue);
          if (!sizeObj) {
            toast.error("Selected size not found in color");
            return;
          }

          // Check available stock
          const availableStock = sizeObj.quantity;
          if (quantity > availableStock) {
            toast.error(`Only ${availableStock} items available in stock`);
            return;
          }

          // Create the unique cart key for this item
          const cartKey = `${product._id}-${variationId}-${colorName}-${sizeValue}`;

          // Check if item exists in current cart state before API call
          const currentCart = get().cart;
          const existingItemBeforeAPI = currentCart.find(
            (item) => item.key === cartKey
          );

          // API call to add to cart
          const res = await axiosBaseURL.post("/cart", {
            productId: product._id,
            variationId: variationId,
            color: colorName,
            size: sizeValue,
            quantity: quantity,
          });

          if (!res.data.success) {
            toast.error("Failed to add to cart");
            return;
          }

          // Instead of manually updating the state, fetch the latest cart from API
          // This ensures we have the correct state after page reloads
          await get().getCartItems();

          toast.success("Added to cart!");
          get().calculate_Total_AmountInCart();
        } catch (error) {
          console.error("Add to cart error:", error);
          toast.error(error.response?.data?.message || "Failed to add to cart");
        }
      },

      removeFromCart: async (productId, variationId) => {
        try {
          // Call the backend to remove the specific variation
          await axiosBaseURL.delete(`/cart`, {
            productId,
            variationId, // Send both productId and variationId
          });

          // Update the frontend cart state
          set((prevState) => ({
            cart: prevState.cart.filter(
              (item) =>
                !(
                  item._id === productId &&
                  item.variations[0]._id === variationId
                ) // Remove the specific variation
            ),
          }));

          // Recalculate the total amount in the cart
          get().calculate_Total_AmountInCart();
        } catch (error) {
          console.error("Error removing item from cart:", error);
          toast.error("Failed to remove item from cart");
        }
      },
      updateQuantity: async (productId, variationId, quantity) => {
        try {
          if (quantity === 0) {
            // If quantity is 0, remove the item from the cart
            await get().removeFromCart(productId, variationId);
            return;
          }

          // Call the backend to update the quantity of the specific variation
          await axiosBaseURL.put(`/cart/${productId}`, {
            variationId, // Include variationId in the request
            quantity,
          });

          // Update the frontend cart state
          set((prevState) => ({
            cart: prevState.cart.map((item) =>
              item._id === productId && item.variations[0]._id === variationId
                ? { ...item, quantity } // Update the quantity of the specific variation
                : item
            ),
          }));

          // Recalculate the total amount in the cart
          get().calculate_Total_AmountInCart();
        } catch (error) {
          console.error("Error updating cart item quantity:", error);
          toast.error("Failed to update item quantity");
        }
      },

      clearCart: async () => {
        set({ loading: true });
        try {
          await axiosBaseURL.delete("/cart");
          set({ cart: [], coupon: null, total: 0, subtotal: 0 });
        } catch (error) {
          console.log("Error in clearCart:", error);
          toast.error("An error occurred in clearing cart");
        } finally {
          set({ loading: false });
        }
      },

      calculate_Total_AmountInCart: () => {
        const { cart, coupon } = get();
        console.log("Calculating total amount in cart...");
        console.log("Cart:", cart);
        // If cart is empty, reset totals
        if (!Array.isArray(cart)) {
          console.warn("Invalid cart data");
          return set({ subTotal: 0, total: 0 });
        }

        // Calculate subtotal
        const subTotal = cart.reduce((sum, item) => {
          // Validate item structure
          if (!item || typeof item !== "object") {
            console.warn("Invalid item in cart:", item);
            return sum;
          }

          // Use the size object's price if available, fallback to base price
          const price = parseFloat(
            item?.variations[0].colors[0].sizes[0]?.price?.amount || 0
          );

          const quantity = parseInt(item.quantity, 10);

          // Validate price and quantity
          if (isNaN(price)) {
            console.warn("Invalid price for item:", item);
            return sum;
          }

          if (isNaN(quantity)) {
            console.warn("Invalid quantity for item:", item);
            return sum;
          }

          return sum + price * quantity;
        }, 0);

        // Calculate total with coupon discount
        let total = subTotal;
        if (coupon && typeof coupon.discountPercentage === "number") {
          const discount = subTotal * (coupon.discountPercentage / 100);
          total = Math.max(0, subTotal - discount); // Ensure total isn't negative
        }
        console.log("Coupon:", coupon);
        console.log("SubTotal:", subTotal);
        console.log("Total:", total);
        console.log("Discount:", coupon?.discountPercentage);
        console.log("Savings:", subTotal - total);

        // Update state
        set({ subTotal, total });
      },

      // enter shipping address
      saveShippingAddress: async (address) => {
        console.log("Shipping address:", address);
        try {
          const response = await axiosBaseURL.post("/address", {
            ...address,
          });

          console.log("Response:", response);

          if (response.status === 201 || response.status === 200) {
            // localStorage.removeItem("address"); // Clear localStorage on successful save
            toast.success(
              response.data.message || " address saved successfully"
            );
            return response;
          } else {
            console.error("Failed to save address");
          }
        } catch (error) {
          console.log("Error in submitShippingAddress:", error);
          toast.error("Failed to save address");
        }
      },
    }),
    { name: "cart-storage" }
  )
);
