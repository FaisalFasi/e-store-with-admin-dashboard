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

export const initialProductState = {
  name: "",
  description: "",
  brand: "",
  pricing: {
    basePrice: 0,
    currency: "USD",
  },
  category: {
    l1: "",
    l2: "",
    l3: "",
    l4: "",
  },
  stock: 0,
  tags: [],
  status: "draft",
  isFeatured: false,
  images: [],
  variations: [
    {
      color: "",
      colorName: "",
      colorImages: [],
      sizes: [
        {
          size: "",
          price: { amount: 0, currency: "USD" },
          quantity: 0,
        },
      ],
    },
  ],
  metaTitle: "",
  metaDescription: "",
};
