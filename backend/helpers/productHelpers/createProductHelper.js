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
          name: variation.colorName,
          imageUrls: uploadedColorImages,
          sizes: await processSizes(variation.sizes, vIndex),
        },
      };
    })
  );
};

export const processSizes = async (sizes) => {
  return Promise.all(
    sizes.map(async (size) => {
      return {
        ...size,
        value: size.value,
        price: parseFloat(size.price),
        quantity: parseInt(size.quantity),
        sku: size.sku || undefined,
        barcode: size.barcode || undefined,
      };
    })
  );
};

export const createProductVariations = async (
  productId,
  variations,
  session
) => {
  const variationIds = [];
  let defaultVariationId = null;

  for (const [index, variationData] of variations.entries()) {
    const variation = new ProductVariation({
      productId,
      colors: [
        {
          name: variationData.color.name,
          imageUrls: variationData.color.imageUrls,
          sizes: variationData.color.sizes,
          isDefault: index === 0,
        },
      ],
      metadata: variationData.metadata || {},
    });

    await variation.save({ session });
    variationIds.push(variation._id);

    if (index === 0) {
      defaultVariationId = variation._id;
    }
  }

  return { variationIds, defaultVariationId };
};

export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
