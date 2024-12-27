import Category from "../../models/category.model.js";

// Define parent categories with child categories
const defaultCategories = [
  {
    name: "Jeans",
    slug: "jeans",
    image: "https://i.ibb.co/Hg94hbs/jeans.jpg",
    description:
      "Jeans are a type of pants or trousers, typically made from denim or dungaree cloth. Starting in the 1950s, jeans became popular among teenagers.",
    parentCategory: null, // Parent category is null (top-level)
    status: "active",
    sortOrder: 0,
    metaTitle: "Jeans",
    metaDescription: "Jeans",
    // Add child categories under 'Jeans'
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
    // Add child categories under 'T-shirts'
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
