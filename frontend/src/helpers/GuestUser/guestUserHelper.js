import axiosBaseURL from "@/lib/axios";
import { get_uuid } from "@/utils/get_uuid_v4.js";

export const createGuestIdentifier = () => {
  // Store in localStorage when a new user visits
  if (!localStorage.getItem("guestId")) {
    const guest_id = get_uuid;
    localStorage.setItem("guestId", guest_id);
  }
};

// Store cart in localStorage
export function updateGuestCart(cartItems) {
  localStorage.setItem("guestCart", JSON.stringify(cartItems));

  // Optionally sync with server if you have a guestId
  const guestId = localStorage.getItem("guestId");
  if (guestId) {
    try {
      // need to implement the API endpoint to sync guest cart with server
      axiosBaseURL.post("/guest-carts", {
        guestId,
        cartItems,
      });
    } catch (error) {
      console.error("Error syncing guest cart with server:", error);
    }
  }
}
