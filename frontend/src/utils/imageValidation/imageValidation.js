// imageUtils.js
import toast from "react-hot-toast";

/**
 * Validates and processes selected image files.
 * @param {FileList} files - The selected files from the input.
 * @param {Array} allowedTypes - Array of allowed MIME types.
 * @returns {Array} - Array of valid image files.
 */

export const handleImageValidation = (files) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/avif",
  ];
  const maxFiles = 5;

  // If no files selected, just return the existing images
  if (!files || files.length === 0) {
    return [];
  }

  const validImages = []; // Start with existing images

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `Invalid file type: ${file.name}. Allowed types: JPEG, PNG, WEBP.`
      );
      continue;
    }

    // Check max file limit
    if (validImages.length >= maxFiles) {
      toast.error(`You can upload up to ${maxFiles} images.`);
      break;
    }

    // Add the valid image to the list
    validImages.push(file);
  }

  // Return the updated list of images (existing + new)
  return validImages;
};

// handle image change
/**
 * Handles the image change event.
 * @param {FileList} files - The selected files from the input.
 * @returns {Array} - Array of valid image files.
 */

export const validateImages = (files) => {
  if (!files || files === "undefined") return;

  const validFiles = handleImageValidation(files);

  const previewImages = validFiles.map((file) => URL.createObjectURL(file));
  console.log("Preview : ", previewImages);
  return previewImages;
};

/**
 * Removes an image from the list.
 * @param {Array} images - The current list of images.
 * @param {number} index - The index of the image to remove.
 * @returns {Array} - Updated list of images.
 */

export const removeImageFromList = (images, index) => {
  return images.filter((_, i) => i !== index);
};

/**
 * Converts an array of image files to FormData for submission.
 *
 * @param {Object} data - The other form data (e.g., name, description, etc.).
 * @param {Array} images - The list of images to be appended.
 * @param {string} imageFieldName - The name of the image field in the backend.
 * @returns {FormData} - The FormData object ready for submission.
 */
export const createFormDataWithImages = (
  data,
  images,
  imageFieldName = "images"
) => {
  const formData = new FormData();

  // Append non-image data
  for (const key in data) {
    formData.append(key, data[key]);
  }

  // Append images
  images.forEach((image) => {
    formData.append(imageFieldName, image);
  });

  return formData;
};
