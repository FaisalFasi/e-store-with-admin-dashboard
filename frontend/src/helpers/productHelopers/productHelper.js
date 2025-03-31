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
  quantity: 1,
  price: "",
  images: [],
};

export const initialProductState = {
  name: "",
  description: "",
  category: {
    parent: "",
    child: null,
    grandchild: null,
  },
  basePrice: 0,
  stock: 0,
  tags: [],
  status: "draft",
  isFeatured: false,
  variations: [
    {
      color: "",
      colorName: "",
      colorImages: [],
      sizes: [
        {
          value: "",
          price: 0,
          quantity: 0,
        },
      ],
    },
  ],
};
