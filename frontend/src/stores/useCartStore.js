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
  addToCart: async (product) => {
    try {
      const availableStock = product.quantity; // Assuming the product has a `stock` property
      console.log("Product:", product);
      console.log("Available stock:", availableStock);
      // Find the existing item in the cart
      const existingItem = get().cart.find((item) => item._id === product._id);
      const cartQuantity = existingItem ? existingItem.quantity : 0;

      console.log("Existing item:", existingItem);
      // Check if the cart quantity exceeds the available stock
      if (cartQuantity >= availableStock) {
        toast.error(
          `You can't add more of this product. Only ${availableStock} left in stock.`
        );
        return;
      }
      await axiosBaseURL.post("/cart", { productId: product._id });

      toast.success("Product added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculate_Total_AmountInCart();
    } catch (error) {
      console.log("Error in addToCart:", error);
      toast.error(error.response || "An error occurred");
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

  calculate_Total_AmountInCart: () => {
    const { cart, coupon } = get();
    // reduce the cart items to get the total amount
    // reduce initial value as arguments and returns a single value like sum of all the items in the array
    const subTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subTotal;

    if (coupon) {
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }
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
