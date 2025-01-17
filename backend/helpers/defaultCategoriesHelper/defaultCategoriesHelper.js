import mongoose from "mongoose";
import Category from "../../models/category.model.js";

const defaultCategories = [
  {
    name: "Clothing",
    slug: "clothing",
    image: "https://i.ibb.co/Hg94hbs/clothing.jpg",
    description:
      "Clothing is any item worn on the body. It serves aesthetic, cultural, and practical purposes.",
    parentCategory: null,
    status: "active",
    sortOrder: 0,
    metaTitle: "Clothing",
    metaDescription: "Clothing Category",
    subCategories: [
      {
        name: "Jeans",
        slug: "jeans",
        image: "https://i.ibb.co/Hg94hbs/jeans.jpg",
        description:
          "Jeans are a type of pants or trousers, typically made from denim or dungaree cloth.",
        parentCategory: "Clothing",
        status: "active",
        sortOrder: 1,
        metaTitle: "Jeans",
        metaDescription: "Jeans Category",
        subCategories: [
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
        name: "Shirts",
        slug: "shirts",
        image: "https://i.ibb.co/Hg94hbs/shirts.jpg",
        description:
          "Shirts are garments for the upper body, often with buttons.",
        parentCategory: "Clothing",
        status: "active",
        sortOrder: 2,
        metaTitle: "Shirts",
        metaDescription: "Shirts Category",
        subCategories: [
          {
            name: "Formal Shirts",
            slug: "formal-shirts",
            description: "Shirts suitable for formal occasions.",
            image: "https://i.ibb.co/Hg94hbs/shirts.jpg",
            status: "active",
            sortOrder: 1,
            metaTitle: "Formal Shirts",
            metaDescription: "Formal Shirts",
          },
          {
            name: "Casual Shirts",
            slug: "casual-shirts",
            description: "Shirts suitable for casual wear.",
            image: "https://i.ibb.co/Hg94hbs/shirts.jpg",
            status: "active",
            sortOrder: 2,
            metaTitle: "Casual Shirts",
            metaDescription: "Casual Shirts",
          },
        ],
      },
    ],
  },

  // {
  //   name: "T-shirts",
  //   image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
  //   slug: "t-shirts",
  //   description:
  //     "T-shirts are a style of clothing, usually short-sleeved, made of cotton or a similar fabric.",
  //   parentCategory: null,
  //   status: "active",
  //   sortOrder: 1,
  //   metaTitle: "T-shirts",
  //   metaDescription: "T-shirts",
  //   subCategories: [
  //     {
  //       name: "Graphic T-shirts",
  //       slug: "graphic-t-shirts",
  //       description: "T-shirts with printed designs.",
  //       image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
  //       status: "active",
  //       sortOrder: 1,
  //       metaTitle: "Graphic T-shirts",
  //       metaDescription: "Graphic T-shirts",
  //     },
  //     {
  //       name: "Plain T-shirts",
  //       slug: "plain-t-shirts",
  //       description: "Simple T-shirts without graphics or designs.",
  //       image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
  //       status: "active",
  //       sortOrder: 2,
  //       metaTitle: "Plain T-shirts",
  //       metaDescription: "Plain T-shirts",
  //     },
  //     {
  //       name: "V-neck T-shirts",
  //       slug: "v-neck-t-shirts",
  //       description: "T-shirts with a V-shaped neckline.",
  //       image: "https://i.ibb.co/5KzbNmt/tshirts.jpg",
  //       status: "active",
  //       sortOrder: 3,
  //       metaTitle: "V-neck T-shirts",
  //       metaDescription: "V-neck T-shirts",
  //     },
  //   ],
  // },

  // {
  //   name: "Shoes",
  //   image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
  //   slug: "shoes",
  //   description:
  //     "Shoes are an item of footwear, typically made from leather, rubber, or fabric.",
  //   parentCategory: null,
  //   status: "active",
  //   sortOrder: 2,
  //   metaTitle: "Shoes",
  //   metaDescription: "Shoes",
  //   subCategories: [
  //     {
  //       name: "Sneakers",
  //       slug: "sneakers",
  //       description:
  //         "Casual shoes with a rubber sole, often worn for sports or leisure.",
  //       image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
  //       status: "active",
  //       sortOrder: 1,
  //       metaTitle: "Sneakers",
  //       metaDescription: "Sneakers",
  //     },
  //     {
  //       name: "Boots",
  //       slug: "boots",
  //       description: "Sturdy footwear that covers the ankle or lower leg.",
  //       image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
  //       status: "active",
  //       sortOrder: 2,
  //       metaTitle: "Boots",
  //       metaDescription: "Boots",
  //     },
  //     {
  //       name: "Formal Shoes",
  //       slug: "formal-shoes",
  //       description: "Shoes typically worn for formal occasions.",
  //       image: "https://i.ibb.co/Tw2NfCR/shoes.jpg",
  //       status: "active",
  //       sortOrder: 3,
  //       metaTitle: "Formal Shoes",
  //       metaDescription: "Formal Shoes",
  //     },
  //   ],
  // },

  // {
  //   name: "Accessories",
  //   slug: "accessories",
  //   image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
  //   description: "Fashion accessories to complement your look.",
  //   parentCategory: null,
  //   status: "active",
  //   sortOrder: 3,
  //   metaTitle: "Accessories",
  //   metaDescription: "Accessories",
  //   subCategories: [
  //     {
  //       name: "Watches",
  //       slug: "watches",
  //       description: "Timepieces worn as accessories.",
  //       image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
  //       status: "active",
  //       sortOrder: 1,
  //       metaTitle: "Watches",
  //       metaDescription: "Watches",
  //     },
  //     {
  //       name: "Bags",
  //       slug: "bags",
  //       description: "Bags of various styles and sizes.",
  //       image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
  //       status: "active",
  //       sortOrder: 2,
  //       metaTitle: "Bags",
  //       metaDescription: "Bags",
  //     },
  //     {
  //       name: "Belts",
  //       slug: "belts",
  //       description: "Fashion belts to complement your outfit.",
  //       image: "https://i.ibb.co/Y2qVdG9/accessories.jpg",
  //       status: "active",
  //       sortOrder: 3,
  //       metaTitle: "Belts",
  //       metaDescription: "Belts",
  //     },
  //   ],
  // },

  // {
  //   name: "Outerwear",
  //   slug: "outerwear",
  //   image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
  //   description: "Jackets, coats, and other outerwear for different seasons.",
  //   parentCategory: null,
  //   status: "active",
  //   sortOrder: 4,
  //   metaTitle: "Outerwear",
  //   metaDescription: "Outerwear",
  //   subCategories: [
  //     {
  //       name: "Jackets",
  //       slug: "jackets",
  //       description: "Lightweight jackets for mild weather.",
  //       image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
  //       status: "active",
  //       sortOrder: 1,
  //       metaTitle: "Jackets",
  //       metaDescription: "Jackets",
  //     },
  //     {
  //       name: "Coats",
  //       slug: "coats",
  //       description: "Heavy coats for cold weather.",
  //       image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
  //       status: "active",
  //       sortOrder: 2,
  //       metaTitle: "Coats",
  //       metaDescription: "Coats",
  //     },
  //     {
  //       name: "Blazers",
  //       slug: "blazers",
  //       description: "Blazers for formal and semi-formal occasions.",
  //       image: "https://i.ibb.co/V3X9kK6/outerwear.jpg",
  //       status: "active",
  //       sortOrder: 3,
  //       metaTitle: "Blazers",
  //       metaDescription: "Blazers",
  //     },
  //   ],
  // },
];

const createCategoryObject = (category, parentCategoryId) => {
  return {
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    parentCategory: parentCategoryId, // Link to the parent category or null if it's a root
    status: category.status,
    sortOrder: category.sortOrder,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    subCategories: [], // Initialize with an empty subCategories array for nesting
  };
};

const createSubCategoryObject = (category, parentCategoryId) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    parentCategory: parentCategoryId, // Link to the parent category or null if it's a root
    status: category.status,
    sortOrder: category.sortOrder,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    subCategories: [], // Initialize with an empty subCategories array for nesting
  };
};
async function createCategoryWithSubcategories(category, parentId = null) {
  let existingCategory = await Category.findOne({ slug: category.slug });

  if (!existingCategory) {
    existingCategory = await Category.create(
      createCategoryObject(category, parentId)
    );
  } else {
    console.log(`Category "${category.slug}" already exists.`);
  }

  if (category.subCategories && category.subCategories?.length > 0) {
    for (const subCategory of category.subCategories) {
      console.log("Subcategory ", subCategory);
      let existingSubCategory = existingCategory.subCategories.find(
        (subCat) => subCat.slug === subCategory.slug
      );

      console.log("Existing subcategory ", existingSubCategory);

      if (!existingSubCategory) {
        const updatedParentcat = await Category.updateOne(
          { _id: existingCategory._id },
          {
            $push: {
              subCategories: createSubCategoryObject(
                subCategory,
                existingCategory._id
              ),
            },
          }
        );
        console.log("updatedParentcat :", updatedParentcat);
      } else {
        console.log(`Subcategory "${subCategory.slug}" already exists.`);
      }
    }
  }
}

async function initializeCategories() {
  for (const category of defaultCategories) {
    await createCategoryWithSubcategories(category);
  }
}

export default initializeCategories;
