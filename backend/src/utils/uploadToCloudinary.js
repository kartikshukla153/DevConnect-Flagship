import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file, folder = "devconnect/chat") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export default uploadToCloudinary;