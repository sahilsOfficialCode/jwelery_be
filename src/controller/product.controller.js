const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const productService = require("../services/product.services");
const ErrorHandler = require("../utils/errorHandler");

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    description,
    price,
    discountPrice,
    quantity,
    brand,
    category,
    subCategory,
    colors,
    sizes,
    ratings,
    offers,
    seller,
  } = req.body;
  if (!name || !description || !price || !quantity || !brand || !category) {
    return next(new ErrorHandler("Missing fields", 400));
  }
  const saveProduct = {
    name,
    description,
    price,
    discountPrice,
    quantity,
    brand,
    category,
    subCategory,
    colors,
    sizes,
    ratings,
    offers,
    seller,
  };
  const addProduct = await productService.createProduct(saveProduct);
  return res.status(201).send({
    success: true,
    addProduct,
    message: "product created successfully",
  });
});

exports.uploadImages = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

  const imageUrls = req.files.images.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    url: baseUrl + file.filename,
  }));
  return res.status(200).send({ success: true, data: imageUrls });
});
