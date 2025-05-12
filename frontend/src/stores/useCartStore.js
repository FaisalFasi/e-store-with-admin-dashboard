import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";
import { persist } from "zustand/middleware";
import { useUserStore } from "./useUserStore";
import { size } from "lodash";

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

      addToCart: async (product, selectedVariation) => {
        localStorage.clear("guestCart");

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
          // const currentCart = get().cart;
          // const existingItemBeforeAPI = currentCart.find(
          //   (item) => item.key === cartKey
          // );

          const { user } = useUserStore.getState();
          console.log("User in addToCart:", user);

          if (user) {
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
          } else {
            const cartData = localStorage.getItem("guestCart");
            let guestCart = cartData ? JSON.parse(cartData) : [];

            console.log("Size Object in addToCart:", sizeObj);
            const _selectedSizeValue = sizeObj?.size;
            const _price = sizeObj?.price?.amount || 0;
            const _currency = sizeObj?.price?.currency || "USD";
            // Check if item already exists in cart
            const existingItemIndex = guestCart.findIndex(
              (item) => item.key === cartKey
            );
            if (existingItemIndex >= 0) {
              // Update quantity if item exists
              guestCart[existingItemIndex].quantity += quantity;
            } else {
              console.log("Selected Variation:", selectedVar);
              console.log("Selected product:", product);
              // Add new item to cart
              guestCart.push({
                key: cartKey,
                product: {
                  productId: product._id,
                  variationId: variationId,
                  variations: [selectedVar],
                  color: colorName,
                  size: _selectedSizeValue,
                  quantity: quantity,
                  productName: product.productName,
                  productImage: product.productImage,
                  price: {
                    amount: _price,
                    currency: _currency,
                  },
                },
              });
            }
            // Save to localStorage
            localStorage.setItem("guestCart", JSON.stringify(guestCart));

            // Update Zustand state
            set({ cart: guestCart });
          }

          toast.success("Added to cart!");
          get().calculate_Total_AmountInCart();
        } catch (error) {
          console.error("Add to cart error:", error);
          toast.error(error.response?.data?.message || "Failed to add to cart");
        }
      },

      getCartItems: async () => {
        set({ loading: true });
        const { user } = useUserStore.getState();

        try {
          if (user) {
            const response = await axiosBaseURL.get("/cart");

            if (!response?.data) {
              throw new Error("Invalid response from server");
            }
            const { cartItems } = response?.data || {}; // Destructure cartItems

            set({
              cart: cartItems || [], // Fallback to an empty array if cartItems is undefined
              loading: false,
            });
          } else {
            const cartData = localStorage.getItem("guestCart");
            let guestCart = cartData ? JSON.parse(cartData) : [];

            set({ cart: guestCart });
          }

          get().calculate_Total_AmountInCart(); // Use consistent naming
        } catch (error) {
          console.error("Error in getCartItems:", error); // Log the error for debugging
          if (error.response?.status !== 401) {
            toast.error("Failed to load cart items. Please try again later.");
          }
          set({
            cart: [],
            total: 0,
            subTotal: 0,
            loading: false,
          });
        }
      },

      removeFromCart: async (
        productId = "",
        variationId = "",
        productKey = null
      ) => {
        const { user } = useUserStore.getState();

        try {
          if (user) {
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
          } else {
            // LocalStorage removal for guests
            const guestCart = JSON.parse(
              localStorage.getItem("guestCart") || "[]"
            );

            console.log("Guest Cart before removal:", guestCart);
            console.log("Product Key:", productKey);

            if (productKey && guestCart.length > 0) {
              const updatedCart = guestCart.filter(
                (item) => item.key !== productKey
              );
              localStorage.setItem("guestCart", JSON.stringify(updatedCart));
              set({ cart: updatedCart });
            }
          }

          // Recalculate the total amount in the cart
          get().calculate_Total_AmountInCart();
        } catch (error) {
          console.error("Error removing item from cart:", error);
          toast.error("Failed to remove item from cart");
        }
      },
      updateQuantity: async (
        productId = "",
        variationId = "",
        quantity = 0,
        productKey = null
      ) => {
        const { user } = useUserStore.getState();

        try {
          if (user) {
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
          } else {
            // LocalStorage update for guests
            const guestCart = JSON.parse(
              localStorage.getItem("guestCart") || []
            );
            const updatedCart = guestCart.map((item) => {
              if (item.key === productKey) {
                return { ...item, quantity: quantity };
              }
              return item;
            });
            localStorage.setItem("guestCart", JSON.stringify(updatedCart));
            set({ cart: updatedCart });
          }

          // Recalculate the total amount in the cart
          get().calculate_Total_AmountInCart();
        } catch (error) {
          console.error("Error updating cart item quantity:", error);
          toast.error("Failed to update item quantity");
        }
      },

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
        // If cart is empty, reset totals
        if (!Array.isArray(cart)) {
          console.warn("Invalid cart data");
          return set({ subTotal: 0, total: 0 });
        }
        console.log("Cart in calculate_Total_AmountInCart:", cart);
        // Calculate subtotal
        const subTotal = cart.reduce((sum, item) => {
          // Validate item structure
          if (!item || typeof item !== "object") {
            console.warn("Invalid item in cart:", item);
            return sum;
          }
          let price = 0;
          console.log("Item in cart:", item);
          if (item.key) {
            price = parseFloat(item?.product?.price?.amount || 0);
          } else {
            // Use the size object's price if available, fallback to base price
            price = parseFloat(
              item?.variations[0]?.colors[0]?.sizes[0]?.price?.amount || 0
            );
          }

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

        console.log("Subtotal in calculate_Total_AmountInCart:", subTotal);
        // Calculate total with coupon discount
        let total = subTotal;
        if (coupon && typeof coupon.discountPercentage === "number") {
          const discount = subTotal * (coupon.discountPercentage / 100);
          total = Math.max(0, subTotal - discount); // Ensure total isn't negative
        }

        // Update state
        set({ subTotal, total });
      },

      // enter shipping address
      saveShippingAddress: async (address) => {
        try {
          const response = await axiosBaseURL.post("/address", {
            ...address,
          });

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
