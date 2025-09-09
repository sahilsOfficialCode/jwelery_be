require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// 🔹 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Upload buffer helper
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// delete img
//     await cloudinary.uploader.destroy(publicId);

// delete multiple imgs
//     await cloudinary.api.delete_resources(publicIds);

module.exports = { cloudinary, uploadBufferToCloudinary };
