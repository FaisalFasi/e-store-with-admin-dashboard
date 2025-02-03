import { v4 as uuidv4 } from "uuid";

export const get_uuid = () => {
  const id = uuidv4();

  return id; // Generates a unique ID
};
