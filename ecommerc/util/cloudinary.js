import { v2 as cloudinary } from "cloudinary";
import "../env.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folderName) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: folderName,
  });
};

export const uploadToCloudinaryFromBuffer = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export default cloudinary;
