// Helper functions

import ProductVariation from "../../models/productVariation.model.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

export const processVariations = async (variations, files) => {
  return Promise.all(
    variations.map(async (variation, vIndex) => {
      const colorImages = files.filter((f) =>
        f.fieldname.startsWith(`variations[${vIndex}].colorImages`)
      );

      const uploadedColorImages = await uploadToCloudinary(
        colorImages,
        "products/variations/colors"
      );

      return {
        ...variation,
        color: {
          color: variation.color,
          name: variation.colorName,
          imageUrls: uploadedColorImages,
          sizes: await processSizes(variation.sizes, vIndex),
        },
      };
    })
  );
};

export const processSizes = async (sizes, vIndex) => {
  return Promise.all(
    sizes.map(async (size, sIndex) => {
      return {
        ...size,
        value: size.value,
        price: parseFloat(size.price),
        quantity: parseInt(size.quantity),
        sku: size.sku || `SKU-${Date.now()}-${vIndex}-${sIndex}`, // Generate if missing
        barcode: size.barcode || `BARCODE-${Date.now()}-${vIndex}-${sIndex}`, // Generate if missing
      };
    })
  );
};

// export const createProductVariations = async (
//   productId,
//   variations,
//   session
// ) => {
//   const variationIds = [];
//   let defaultVariationId = null;

//   for (const [index, variationData] of variations.entries()) {
//     const variation = new ProductVariation({
//       productId,
//       colors: [
//         {
//           color: variationData.color.color,
//           name: variationData.color.name,
//           imageUrls: variationData.color.imageUrls,
//           sizes: variationData.color.sizes,
//           isDefault: index === 0,
//         },
//       ],
//       metadata: variationData.metadata || {},
//     });

//     await variation.save({ session });
//     variationIds.push(variation._id);

//     if (index === 0) {
//       defaultVariationId = variation._id;
//     }
//   }

//   return { variationIds, defaultVariationId };
// };

// Updated createProductVariations helper
export const createProductVariations = async (
  productId,
  variations,
  currency,
  session
) => {
  const variationDocs = await ProductVariation.insertMany(
    variations.map((variation) => ({
      productId,
      colors: variation.colors.map((color) => ({
        ...color,
        sizes: color.sizes.map((size) => ({
          ...size,
          price: {
            amount: Math.round(size.price * 100), // Convert to cents
            currency: currency, // Use product's currency
          },
        })),
      })),
      status: "active",
    })),
    { session }
  );

  return {
    variationIds: variationDocs.map((doc) => doc._id),
    defaultVariationId: variationDocs[0]._id, // Or your logic to determine default
  };
};

export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
