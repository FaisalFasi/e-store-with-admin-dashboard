// Helper functions
import ProductVariation from "../../models/productVariation.model.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import { get_uuid } from "../../utils/uuidGenerator.js";

// Improved variation processing with better error handling
export const processVariations = async (variations, files = []) => {
  try {
    if (!variations || !Array.isArray(variations)) {
      throw new Error("Variations must be an array");
    }

    const processedVariations = await Promise.all(
      variations.map(async (variation, vIndex) => {
        // More robust file filtering
        const colorImages = files.filter((f) =>
          f.fieldname?.includes(`variations[${vIndex}].colorImages`)
        );

        const uploadedImages =
          colorImages.length > 0
            ? await uploadToCloudinary(
                colorImages,
                "products/variations/colors-images"
              )
            : [];

        const imageUrls = uploadedImages.map((img) => img);

        const hasImages =
          imageUrls.length > 0 || variation.imageUrls?.length > 0;

        if (!hasImages) {
          throw new Error(`Variation ${vIndex} must have at least one image`);
        }

        return {
          ...variation,
          color: variation?.color || "#000000",
          colorName: variation?.colorName || "Unnamed",
          imageUrls: imageUrls,
          sizes: await processSizes(variation?.sizes || [], vIndex),
          isDefault: variation?.isDefault || false,
        };
      })
    );

    return processedVariations;
  } catch (error) {
    console.error("Error processing variations:", error);
    throw new Error(`Variation processing failed: ${error.message}`);
  }
};

// More robust size processing
export const processSizes = async (sizes, vIndex) => {
  if (!Array.isArray(sizes)) return [];

  return Promise.all(
    sizes.map(async (size, sIndex) => {
      const amount = parseFloat(size?.price?.amount) || 0;
      const currency = size?.price?.currency || "USD";
      console.log("Price amount:", amount);

      return {
        size: String(size.size).toUpperCase().trim(),
        quantity: parseInt(size.quantity) || 0,
        price: {
          amount: amount, // Convert to cents
          currency: currency,
        },
        sku: size?.sku || generateTempSku(vIndex, sIndex),
        barcode: size?.barcode || generateTempBarcode(vIndex, sIndex),
        isInStock: (parseInt(size.quantity) || 0) > 0,
        imageUrls: size?.imageUrls || [],
      };
    })
  );
};

export const createProductVariations = async (
  productId,
  variations,
  currency,
  session
) => {
  if (!productId) throw new Error("Product ID is required");
  if (!variations || !Array.isArray(variations)) {
    throw new Error("Variations must be an array");
  }
  console.log("Variation   created:", JSON.stringify(variations));

  try {
    const variationDocs = await ProductVariation.insertMany(
      variations.map((variation) => ({
        productId,
        colors: [
          {
            color: variation.color,
            colorName: variation.colorName,
            imageUrls: Array.isArray(variation.imageUrls)
              ? variation.imageUrls.filter((url) => url) // Remove null/undefined
              : [], // Fallback to empty array
            sizes: variation.sizes.map((size) => ({
              size: size.size,
              quantity: size.quantity,
              sku:
                size.sku ||
                generateTempSku(productId, variation.colorName, size.size),
              barcode: size.barcode || generateTempBarcode(),
              price: {
                // amount: Math.round((size.price?.amount || 0) * 100),
                amount: size.price?.amount || 0,
                currency: size.price?.currency || currency,
              },
              isInStock: (size.quantity || 0) > 0,
            })),
            isDefault: variation.isDefault,
          },
        ],
        status: "active",
      })),
      { session }
    );

    console.log("Variation documents created:", JSON.stringify(variationDocs));
    return {
      variationIds: variationDocs.map((doc) => doc._id),
      defaultVariationId: variationDocs[0]?._id || null,
    };
  } catch (error) {
    console.error("Variation creation failed:", {
      error: error.message,
      variations: JSON.stringify(variations, null, 2),
    });
    throw error;
  }
};
// Temporary SKU for processing (will be replaced in pre-save hook)
const generateTempSku = (vIndex, sIndex) => {
  return `TEMP-SKU-${vIndex}-${sIndex}-${Date.now()}`;
};

// Temporary barcode for processing
const generateTempBarcode = (vIndex, sIndex) => {
  return `TEMP-BC-${vIndex}-${sIndex}-${Date.now()}`;
};
export const generateSlug = (name) => {
  const uniqueSuffix = get_uuid();

  const baseSlug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .slice(0, 60); // Truncate to 60 chars

  return `${baseSlug}-${uniqueSuffix}`;
};
