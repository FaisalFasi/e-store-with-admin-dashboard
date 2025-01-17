// helpers/productHelpers.js
// import fetcher from "../fetcher";

// export const fetchProductsHelper = async (endpoint) => {
//   const { data, error } = await fetcher(endpoint); // Use your custom fetcher
//   if (error) {
//     throw new Error(error.message || "Failed to fetch products");
//   }
//   return data.products;
// };

// create product variation fields
export const variationFields = [
  { name: "size", label: "Size", type: "text", required: true },
  { name: "color", label: "Color", type: "text", required: true },
  {
    name: "quantity",
    label: "Quantity",
    type: "number",
    required: true,
    min: 0,

    step: 1,
  },
  {
    name: "price",
    label: "Price",
    type: "number",
    placeholder: "Enter price for this variation",
    required: true,
    min: 0,
  },
  {
    name: "images",
    label: "Upload Images",
    type: "file",
    accept: "image/*",
    placeholder: "Choose product images",
    required: true,
  },
];
export const initializeVariation = {
  size: "",
  color: "",
  quantity: 0,
  price: "",
  images: [],
};
