import { v2 as cloudinary } from "cloudinary";
import "../env.js";
// We wrap the configuration in a function so it executes on-demand, 
// ensuring process.env is fully loaded when called.
export const uploadToCloudinary = async (filePath, folderName) => {
  // Config runs dynamically inside the execution loop
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Execute the upload and return the result
  return await cloudinary.uploader.upload(filePath, {
    folder: folderName,
  });
};

export default cloudinary;