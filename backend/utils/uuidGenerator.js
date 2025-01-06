import { v4 as uuidv4 } from "uuid";

export const get_uuid = () => {
  const id = uuidv4();

  console.log("generateGuestId", id);
  return id; // Generates a unique ID for the guest
};
