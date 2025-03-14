import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosBaseURL from "../lib/axios";
import { loadStripe } from "@stripe/stripe-js";

const getInitialAddressState = () => {
  const savedAddress = localStorage.getItem("address");

  try {
    // Handle cases where savedAddress is "undefined" or null
    if (!savedAddress || savedAddress === "undefined") {
      return {
        fullName: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: "",
      };
    }
    return JSON.parse(savedAddress);
  } catch (error) {
    console.error("Error parsing saved address from localStorage:", error);
    // Return default state in case of any parsing error
    return {
      fullName: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phoneNumber: "",
    };
  }
};
const stripePromise = loadStripe(
  "pk_test_51QHTGCGL2ttkOT4rL7vt5eQHDnaeimKzWDxjcQ89KJjjZ6JMt1GlHOXkrQDZODVxI30k2331AfVvRyjQAUM2sK5L00WGfGGhzq"
);

export const useCheckoutStore = create((set, get) => ({
  address: getInitialAddressState(),
  currentStep: "cart",
  isAddressModalOpen: false,
  loading: false,
  errors: {},

  // write initial state to set the adress object

  setAddress: (updatedFields) =>
    set((state) => ({
      address: { ...state.address, ...updatedFields },
    })),

  setErrors: (errors) => set({ errors }),

  openAddressModal: () => set({ isAddressModalOpen: true }),
  closeAdressModal: () =>
    set({ isAddressModalOpen: false, currentStep: "cart" }),
  resetToCart: () => set({ currentStep: "cart" }),
  resetToAddress: () => set({ currentStep: "address" }),
  resetToCheckout: () => set({ currentStep: "checkout" }),
  setCurrentStep: (step) => set({ currentStep: step }),

  // write a function to handle the payment
  handlePayment: async (cart, coupon) => {
    const { currentStep, openAddressModal, resetToAddress } = get();

    console.log("Current Step:", currentStep);
    console.log("Cart:", cart);
    console.log("Coupon:", coupon);

    if (currentStep === "address") {
      const stripe = await stripePromise;
      try {
        const res = await axiosBaseURL.post(
          "/payments/create-checkout-session",
          {
            products: cart,
            couponCode: coupon ? coupon.code : null,
          }
        );
        console.log("Response :", res);

        const session = res?.data;
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          console.error("Stripe error:", result.error);
          toast.error("Payment failed. Please try again.");
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      openAddressModal();
      resetToAddress();
    }
  },
}));
