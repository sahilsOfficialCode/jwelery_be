const { uploadBufferToCloudinary, cloudinary } = require("../utils/cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Image = require("../model/image.model");

exports.uploadImages = catchAsyncErrors(async (req, res, next) => {
  const uploadedImages = {};

  // Profile
  if (req.files?.profile) {
    const result = await uploadBufferToCloudinary(
      req.files.profile[0].buffer,
      "ecommerce/profile"
    );
     // Save to DB
     const imgSave = await Image.create({
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        size: result.bytes,
        folder: "ecommerce/profile",
      });
    uploadedImages.profile = imgSave._id;
  }

  // Multiple product images
  if (req.files?.images) {
    uploadedImages.images = [];
    for (const file of req.files.images) {
      const result = await uploadBufferToCloudinary(
        file.buffer,
        "ecommerce/products"
      );
       // Save to DB
     const imgSave = await Image.create({
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        size: result.bytes,
        folder: "ecommerce/products",
      });
      uploadedImages.images.push(imgSave._id);
    }
  }

  // Banner
  if (req.files?.banner) {
    const result = await uploadBufferToCloudinary(
      req.files.banner[0].buffer,
      "ecommerce/banners"
    );
    const mediaDoc = await Media.create({
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        size: result.bytes,
        folder: "ecommerce/banners",
      });
    uploadedImages.banner = mediaDoc._id;
  }

  res.status(200).json({ success: true, data: uploadedImages });
});
