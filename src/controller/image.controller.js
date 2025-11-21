const { uploadBufferToCloudinary, cloudinary } = require("../utils/cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Image = require("../model/image.model");
const product = require("../model/product.model");
const imageService = require("../services/imageService");
const productService = require("../services/product.service");
const ErrorHandler = require("../utils/errorHandler");

exports.uploadImages = catchAsyncErrors(async (req, res, next) => {
  const uploadedImages = {};

  // Profile
  if (req.files?.profile) {
    const result = await uploadBufferToCloudinary(
      req.files.profile[0].buffer,
      "ecommerce/profile"
    );
    // Save to DB
    const imageResult = {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      size: result.bytes,
      folder: "ecommerce/profile",
    }
    const imgResult = await imageService.createImage(imageResult);
    uploadedImages.profile = imgResult._id;
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
      const imageResult = {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        size: result.bytes,
        folder: "ecommerce/products",
        color: Array.isArray(colors) ? colors[index] : colors
      }
      const imgResult = await imageService.createImage(imageResult);
      uploadedImages.images.push(imgResult._id);
    }
  }

  // Banner
  if (req.files?.banner) {
    const result = await uploadBufferToCloudinary(
      req.files.banner[0].buffer,
      "ecommerce/banners"
    );
    const imageResult = {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      size: result.bytes,
      folder: "ecommerce/banners",
    }
    const imgResult = await imageService.createImage(imageResult)
    uploadedImages.banner = imgResult._id;
  }

  res.status(200).json({ success: true, data: uploadedImages });
});

exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  console.log("delete image working")
  const { image_id } = req.query
  const { id } = req.params
  if (!id || !image_id) {
    return next(new ErrorHandler("Image id is required", 400));
  }
  const productData = await productService.getProductToDeleteById(id);
  if (!productData) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const imgDelete = productData.images.find(
    (img) => img._id.toString() === image_id
  );

  const imageData = await imageService.findImageById(imgDelete)

  if (!imgDelete) {
    return next(new ErrorHandler("Image not found in this product", 404));
  }

  await cloudinary.uploader.destroy(imageData.public_id);

  await imageService.deleteImage(imgDelete._id);

  productData.images = productData.images.filter(
    (img) => img._id.toString() !== image_id
  );
  await productData.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});
