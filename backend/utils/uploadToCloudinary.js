import cloudinary from "../lib/cloudinary.js";
import fs from "fs/promises";

export const uploadToCloudinary = async (requestedFiles, folder) => {
  // the promise will return an array of the uploaded images
  return await Promise.all(
    requestedFiles?.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: folder,
        });
        // Clean up temporary file
        if (result) await fs.unlink(file.path);

        // Check if the upload was successful
        if (!result || !result.secure_url) {
          throw new Error("Image upload failed");
        }
        // Return the URL of the uploaded image

        return result.secure_url; // Return the URL of the uploaded image
      } catch (error) {
        console.error(`Error uploading ${file.filename}:`, error);
        // Return an error res message if the image upload fails with status code
        return res.status(500).json({
          message: "Internal Server Error while uploading images",
          error,
        });
      }
    })
  );
};
