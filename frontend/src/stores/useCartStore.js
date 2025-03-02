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
      const sizeValue = selectedSize.value;
      const colorName = selectedColor.name;
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
        (c) => c.name === colorName
      );
      if (!colorObj) {
        toast.error("Selected color not found in variation");
        return;
      }

      // Find matching size in the color
      const sizeObj = colorObj.sizes.find((s) => s.value === sizeValue);
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

      // Update local cart state
      set((prevState) => {
        const cartKey = `${product._id}-${variationId}-${colorName}-${sizeValue}`;
        const existingItem = prevState.cart.find(
          (item) => item.key === cartKey
        );

        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > availableStock) {
            toast.error(`Cannot exceed available stock of ${availableStock}`);
            return prevState;
          }

          return {
            cart: prevState.cart.map((item) =>
              item.key === cartKey ? { ...item, quantity: newQuantity } : item
            ),
          };
        }
        // Create new cart item
        // const newItem = {
        //   key: cartKey,
        //   productId: product._id,
        //   name: product.name,
        //   basePrice: product.basePrice,
        //   variationId: variationId,
        //   color: colorName,
        //   size: sizeValue,
        //   quantity: quantity,
        //   price: sizeObj.price || product.basePrice,
        //   imageUrl:
        //     colorObj.imageUrls?.[0] ||
        //     product.variations[0]?.colors[0]?.imageUrls?.[0],
        //   stock: availableStock,
        // };

        // return { cart: [...prevState.cart, newItem] };
        return { cart: [...prevState.cart, product] };
      });

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
      const price = parseFloat(item.size?.price || item.basePrice || 0);
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
