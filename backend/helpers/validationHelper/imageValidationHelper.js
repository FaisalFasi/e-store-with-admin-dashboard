import path from "path";
// image validation helper
export const imageValidationHelper = (file) => {
  // Allowed image file types
  const fileTypes = /jpeg|webp|jpg|png|gif|avif/;

  // Check if the file is an array (multiple files) or a single file
  const files = Array.isArray(file) ? file : [file];

  // Check if no files are provided
  if (!files || files.length === 0) {
    return { valid: false, message: "No images uploaded." };
  }
  // Validate each file
  for (const fileItem of files) {
    const extName = fileTypes.test(
      path.extname(fileItem.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(fileItem.mimetype);

    if (!fileItem.mimetype.startsWith("image")) {
      return { valid: false, message: "Please upload only image files." };
    }

    if (!extName || !mimeType) {
      return {
        valid: false,
        message:
          "Invalid file type. Please upload jpeg, jpg, png, or gif images only.",
      };
    }
  }

  return { valid: true, message: "Valid images." };
};

export const imageValidationProductCreationHelper = (files) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Check if no files are provided
  if (!files || files.length === 0) {
    return { valid: false, message: "No images uploaded." };
  }

  // Validate each file
  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        message: "Please upload only jpeg, png, gif, or webp images.",
      };
    }
  }

  return { valid: true, message: "Valid images." };
};
