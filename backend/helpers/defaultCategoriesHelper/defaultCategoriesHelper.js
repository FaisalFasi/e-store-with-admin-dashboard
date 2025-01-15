import Category from "../../models/category.model.js";

// Define parent categories with child categories
const defaultCategories = [
  {
    name: "Jeans",
    slug: "jeans",
    image: "https://i.ibb.co/Hg94hbs/jeans.jpg",
    description:
      "Jeans are a type of pants or trousers, typically made from denim or dungaree cloth. Starting in the 1950s, jeans became popular among teenagers.",
    parentCategory: null,
    status: "active",
    sortOrder: 0,
    metaTitle: "Jeans",
    metaDescription: "Jeans",
    children: [
      {
        name: "Skinny Jeans",
        slug: "skinny-jeans",
        description: "Tightly fitting jeans.",
        image: "https://i.ibb.co/Hg94hbs/jeans.jpg",
        status: "active",
        sortOrder: 1,
        metaTitle: "Skinny Jeans",
        metaDescription: "Skinny Jeans",
      },
      {
        name: "Bootcut Jeans",
        slug: "bootcut-jeans",
        description: "Jeans that flare out slightly at the bottom.",
        image: "https://i.ibb.co/Hg94hbs/jeans.jpg",
        status: "active",
        sortOrder: 2,
        metaTitle: "Bootcut Jeans",
        metaDescription: "Bootcut Jeans",
      },
      {
        name: "Straight Leg Jeans",
        slug: "straight-leg-jeans",
        description: "Jeans with a straight cut from waist to ankle.",
        image: "https://i.ibb.co/Hg94hbs/jeans.jpg",
        status: "active",
        sortOrder: 3,
        metaTitle: "Straight Leg Jeans",
        metaDescription: "Straight Leg Jeans",
      },
    ],
  },

  {
    name: "T-shirts",
    image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
    slug: "t-shirts",
    description:
      "T-shirts are a style of clothing, usually short-sleeved, made of cotton or a similar fabric.",
    parentCategory: null,
    status: "active",
    sortOrder: 1,
    metaTitle: "T-shirts",
    metaDescription: "T-shirts",
    children: [
      {
        name: "Graphic T-shirts",
        slug: "graphic-t-shirts",
        description: "T-shirts with printed designs.",
        image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
        status: "active",
        sortOrder: 1,
        metaTitle: "Graphic T-shirts",
        metaDescription: "Graphic T-shirts",
      },
      {
        name: "Plain T-shirts",
        slug: "plain-t-shirts",
        description: "Simple T-shirts without graphics or designs.",
        image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
        status: "active",
        sortOrder: 2,
        metaTitle: "Plain T-shirts",
        metaDescription: "Plain T-shirts",
      },
      {
        name: "V-neck T-shirts",
        slug: "v-neck-t-shirts",
        description: "T-shirts with a V-shaped neckline.",
        image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
        status: "active",
        sortOrder: 3,
        metaTitle: "V-neck T-shirts",
        metaDescription: "V-neck T-shirts",
      },
    ],
  },

  {
    name: "Shoes",
    image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
    slug: "shoes",
    description:
      "Shoes are an item of footwear, typically made from leather, rubber, or fabric.",
    parentCategory: null,
    status: "active",
    sortOrder: 2,
    metaTitle: "Shoes",
    metaDescription: "Shoes",
    children: [
      {
        name: "Sneakers",
        slug: "sneakers",
        description:
          "Casual shoes with a rubber sole, often worn for sports or leisure.",
        image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
        status: "active",
        sortOrder: 1,
        metaTitle: "Sneakers",
        metaDescription: "Sneakers",
      },
      {
        name: "Boots",
        slug: "boots",
        description: "Sturdy footwear that covers the ankle or lower leg.",
        image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
        status: "active",
        sortOrder: 2,
        metaTitle: "Boots",
        metaDescription: "Boots",
      },
      {
        name: "Formal Shoes",
        slug: "formal-shoes",
        description: "Shoes typically worn for formal occasions.",
        image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
        status: "active",
        sortOrder: 3,
        metaTitle: "Formal Shoes",
        metaDescription: "Formal Shoes",
      },
    ],
  },

  // Additional Categories
  {
    name: "Accessories",
    slug: "accessories",
    image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
    description: "Fashion accessories to complement your look.",
    parentCategory: null,
    status: "active",
    sortOrder: 3,
    metaTitle: "Accessories",
    metaDescription: "Accessories",
    children: [
      {
        name: "Watches",
        slug: "watches",
        description: "Timepieces worn as accessories.",
        image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
        status: "active",
        sortOrder: 1,
        metaTitle: "Watches",
        metaDescription: "Watches",
      },
      {
        name: "Bags",
        slug: "bags",
        description: "Bags of various styles and sizes.",
        image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
        status: "active",
        sortOrder: 2,
        metaTitle: "Bags",
        metaDescription: "Bags",
      },
      {
        name: "Belts",
        slug: "belts",
        description: "Fashion belts to complement your outfit.",
        image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
        status: "active",
        sortOrder: 3,
        metaTitle: "Belts",
        metaDescription: "Belts",
      },
    ],
  },

  {
    name: "Outerwear",
    slug: "outerwear",
    image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
    description: "Jackets, coats, and other outerwear for different seasons.",
    parentCategory: null,
    status: "active",
    sortOrder: 4,
    metaTitle: "Outerwear",
    metaDescription: "Outerwear",
    children: [
      {
        name: "Jackets",
        slug: "jackets",
        description: "Lightweight jackets for mild weather.",
        image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
        status: "active",
        sortOrder: 1,
        metaTitle: "Jackets",
        metaDescription: "Jackets",
      },
      {
        name: "Coats",
        slug: "coats",
        description: "Heavy coats for cold weather.",
        image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
        status: "active",
        sortOrder: 2,
        metaTitle: "Coats",
        metaDescription: "Coats",
      },
      {
        name: "Blazers",
        slug: "blazers",
        description: "Blazers for formal and semi-formal occasions.",
        image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
        status: "active",
        sortOrder: 3,
        metaTitle: "Blazers",
        metaDescription: "Blazers",
      },
    ],
  },
];

async function initializeCategories() {
  for (const category of defaultCategories) {
    const existingCategory = await Category.findOne({ slug: category.slug });
    if (!existingCategory) {
      // Create the parent category
      const parentCategory = await Category.create({
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description,
        parentCategory: category.parentCategory,
        status: category.status,
        sortOrder: category.sortOrder,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
      });

      // Create child categories for the parent category
      for (const child of category.children) {
        await Category.create({
          name: child.name,
          slug: child.slug,
          image: child.image,
          description: child.description,
          parentCategory: parentCategory._id, // Link child to parent category ID
          status: child.status,
          sortOrder: child.sortOrder,
          metaTitle: child.metaTitle,
          metaDescription: child.metaDescription,
        });
      }
    }
  }
}

export default initializeCategories;
