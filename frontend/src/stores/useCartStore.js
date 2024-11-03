import { create } from "zustand";
import axiosBaseURL from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  loading: false,

  getCartItems: async () => {
    set({ loading: true });

    try {
      const response = await axiosBaseURL.get("/cart");
      set({
        cart: response.cart,
        loading: false,
      });
      get().calculate_Total_AmountInCart();
    } catch (error) {
      set({ cart: [], total: 0, subTotal: 0, loading: false });
      console.log("Error in getCartItems:", error);
      toast.error("Error in getCartItems");
    }
  },
  addToCart: async (product) => {
    try {
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
}));
