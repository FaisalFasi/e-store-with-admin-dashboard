import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";
import { keyframes } from "framer-motion";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  loading: false,
  isCouponApplied: false,

  // Fetch the user's active coupon
  getMyCoupon: async () => {
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
    }
  },

  // Apply a coupon by code
  applyCoupon: async (code) => {
    try {
      const { coupon: existingCoupon, isCouponApplied } = get();

      // Check if a coupon is already applied
      if (isCouponApplied) {
        toast.error("A coupon is already applied");
        return;
      }

      // Validate and apply the coupon
      const response = await axiosBaseURL.post("/coupons/validate", { code });
      const coupon = response?.data;

      if (!coupon) {
        toast.error("Invalid coupon code");
        return;
      }

      // Set the coupon and mark it as applied
      set({ coupon, isCouponApplied: true });

      // Recalculate the total amount in the cart
      get().calculate_Total_AmountInCart();

      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
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
      set({
        cart: response?.data?.cartItems,
        loading: false,
      });
      console.log(
        "Cart items:",
        response?.data?.cartItems,
        "Cart items length:",
        response?.data?.cartItems.length
      );

      get().calculate_Total_AmountInCart();
    } catch (error) {
      set({ cart: [], total: 0, subTotal: 0, loading: false });
      console.log("Error in getCartItems:", error);
      toast.error("Error in getCartItems");
    }
  },

  addToCart: async (product, selectedVariation) => {
    console.log("Product in addToCart:", product);
    console.log("selectedVariation in addToCart:", selectedVariation);
    try {
      if (!selectedVariation) {
        toast.error("Please select a variation before adding to the cart.");
        return;
      }

      const productVariation = product.variations.find(
        (variation) => variation._id === selectedVariation._id
      );

      if (!productVariation) {
        toast.error("Selected variation not found in the product.");
        return;
      }

      console.log("Cart in addToCart:", get().cart);

      // Find the existing item in the cart based on productId and variationId
      const existingCartItem = get().cart.find(
        (item) =>
          item._id === product._id &&
          item.variations[0]._id === selectedVariation._id // Check the variation ID
      );

      const cartVariationQuantity = existingCartItem
        ? existingCartItem.quantity
        : 0;

      // Get the actual available stock from the product variation
      const availableStock = productVariation.quantity;

      // Calculate remaining available quantity
      const remainingAvailable = availableStock - cartVariationQuantity;

      if (selectedVariation.quantity > remainingAvailable) {
        toast.error(
          remainingAvailable === 0
            ? "This variation is out of stock."
            : `You can't add more of this variation. Only ${remainingAvailable} left in stock.`
        );
        return; // Exit here to prevent the else block from executing
      } else {
        console.log("Product in addToCart:", product);
        console.log("selectedVariation.quantity :", selectedVariation.quantity);
        console.log("selectedVariation._id :", selectedVariation._id);
        const res = await axiosBaseURL.post("/cart", {
          productId: product._id,
          variationId: selectedVariation._id,
          quantity: selectedVariation.quantity,
        });
        console.log("Response in addToCart:", res);
        if (res.data.success === true) {
          toast.success("Product added to cart!");
        } else {
          console.error("Failed to add product to cart");
          return;
        }
      }

      // Update the frontend cart state
      set((prevState) => {
        const newCart = existingCartItem
          ? prevState.cart.map((item) =>
              item._id === product._id &&
              item.variations[0]._id === selectedVariation._id
                ? {
                    ...item,
                    quantity: item.quantity + selectedVariation.quantity,
                  }
                : item
            )
          : [
              ...prevState.cart,
              {
                ...product,
                _id: product._id,
                variations: [selectedVariation], // Store only the selected variation
                quantity: selectedVariation.quantity,
                key: `${product._id}-${selectedVariation._id}`, // Unique key
              },
            ];
        return { cart: newCart };
      });

      get().calculate_Total_AmountInCart();
    } catch (error) {
      console.log("Error in addToCart:", error);
      toast.error(error.response?.data?.message || "An error occurred");
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
            !(item._id === productId && item.variations[0]._id === variationId) // Remove the specific variation
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
    console.log("Cart in calculate total amount:", cart);

    // Calculate subtotal using the price from the selected variation
    const subTotal = cart.reduce((sum, item) => {
      const selectedVariation = item.variations.find(
        (v) => v._id === item.selectedVariation
      );

      if (!selectedVariation) {
        console.warn("Selected variation not found for item:", item);
        return sum; // Skip this item if the selected variation is not found
      }

      // Ensure price and quantity are valid numbers
      const price = parseFloat(selectedVariation.price);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(price)) {
        console.warn("Invalid price for variation:", selectedVariation);
        return sum; // Skip this item if the price is invalid
      }

      if (isNaN(quantity)) {
        console.warn("Invalid quantity for item:", item);
        return sum; // Skip this item if the quantity is invalid
      }

      return sum + price * quantity;
    }, 0);

    let total = subTotal;

    // Apply coupon discount if available
    if (coupon && !isNaN(coupon.discountPercentage)) {
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }

    // Ensure total is not negative
    total = total < 0 ? 0 : total;

    // Update state with new totals
    set({ subTotal, total });
  },
  // enter shipping address
  saveShippingAddress: async (address) => {
    console.log("Shipping address:", address);
    try {
      const response = await axiosBaseURL.post("/address", {
        ...address,
      });
      if (response.status === 201 || response.status === 200) {
        // localStorage.removeItem("address"); // Clear localStorage on successful save
        toast.success(response.data.message || " address saved successfully");
        return response;
      } else {
        console.error("Failed to save address");
      }
    } catch (error) {
      console.log("Error in submitShippingAddress:", error);
      toast.error("Failed to save address");
    }
  },
}));
