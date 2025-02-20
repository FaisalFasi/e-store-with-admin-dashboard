import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  loading: false,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await axiosBaseURL.get("/coupons");
      set({ coupon: response?.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await axiosBaseURL.post("/coupons/validate", { code });
      set({ coupon: response?.data, isCouponApplied: true });

      get().calculate_Total_AmountInCart();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
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
      console.log("Cart items:", response?.data?.cartItems);

      get().calculate_Total_AmountInCart();
    } catch (error) {
      set({ cart: [], total: 0, subTotal: 0, loading: false });
      console.log("Error in getCartItems:", error);
      toast.error("Error in getCartItems");
    }
  },
  //  Selected variation
  //   _id: '67b483900cd42ea8f075559f',
  //   productId: '67b483900cd42ea8f075559d',
  //   color: 'red',
  //   size: '30',
  //   quantity: 3,
  //   price: 45,

  addToCart: async (product, selectedVariation) => {
    console.log("Product in addToCart:", product);
    console.log("Selected variation in addToCart:", selectedVariation);
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

      // Find the existing item in the cart based on productId and variationId
      const existingCartItem = get().cart.find(
        (item) =>
          item._id === product._id &&
          item.variations.some(
            (variation) => variation._id === selectedVariation._id
          )
      );
      console.log("Existing cart item:", existingCartItem);
      const cartVariationQuantity = existingCartItem
        ? existingCartItem.quantity
        : 0;
      console.log("Cart variation quantity:", cartVariationQuantity);
      // Get the actual available stock from the product variation
      const availableStock = productVariation.quantity;

      // Calculate remaining available quantity
      const remainingAvailable = availableStock - cartVariationQuantity;
      if (remainingAvailable < 1) {
        const errorMessage =
          remainingAvailable === 0
            ? "This variation is out of stock."
            : `You can't add more of this variation. Only ${remainingAvailable} left in stock.`;
        toast.error(errorMessage);
        return;
      }
      const res = await axiosBaseURL.post("/cart", {
        productId: product._id,
        variationId: selectedVariation._id,
        quantity: selectedVariation.quantity,
      });
      if (res.status === 200) {
        toast.success("Product added to cart!");
      } else {
        console.error("Failed to add product to cart");
        return;
      }

      // Update the frontend cart state
      set((prevState) => {
        const newCart = existingCartItem
          ? prevState.cart.map((item) =>
              item.productId === product._id &&
              item.variationId === selectedVariation._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [
              ...prevState.cart,
              {
                ...product,
                productId: product._id,
                variationId: selectedVariation._id,
                quantity: 1,
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
  removeFromCart: async (productId) => {
    await axiosBaseURL.delete(`/cart`, { data: { productId } });
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== productId),
    }));
    get().calculate_Total_AmountInCart();
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    await axiosBaseURL.put(`/cart/${productId}`, { quantity });

    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      ),
    }));
    get().calculate_Total_AmountInCart();
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

  calculate_Total_AmountInCart: async () => {
    const { cart, coupon } = get();
    console.log("Cart in calculate total amount:", cart);

    // Fetch detailed product/variation info if it's not already in the cart
    const cartWithDetails = await Promise.all(
      cart.map(async (item) => {
        const variation = item.variations.find(
          (v) => v._id === item.selectedVariation
        );

        if (!variation || !variation.productId) {
          console.log("Missing productId for variation:", variation);
          return { ...item, price: 0 }; // Avoid making a request with undefined productId
        }

        if (!variation.price) {
          try {
            const response = await axiosBaseURL.get(
              `/products/${variation.productId}`
            );
            const product = response.data;
            console.log("Product in calculate total amount:", product);

            if (!product || !product.variations) {
              console.warn(
                `Product or variations not found for productId: ${variation.productId}`
              );
              return { ...item, price: 0 };
            }

            const selectedVariation = product.variations.find(
              (v) => v._id === item.selectedVariation
            );

            return {
              ...item,
              price: selectedVariation
                ? selectedVariation.price
                : product.price,
            };
          } catch (error) {
            console.error(
              `Error fetching product details for productId: ${variation.productId}`,
              error
            );
            return { ...item, price: 0 };
          }
        }

        return item;
      })
    );

    // Calculate subtotal
    const subTotal = cartWithDetails.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );

    let total = subTotal;

    // Apply coupon discount if available
    if (coupon) {
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }

    // Update state with new totals and detailed cart
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
