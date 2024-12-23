import { v4 as uuidv4 } from "uuid";

export const generateGuestId = () => {
  const guestId = uuidv4();

  console.log("generateGuestId", guestId);
  return guestId; // Generates a unique ID for the guest
};
