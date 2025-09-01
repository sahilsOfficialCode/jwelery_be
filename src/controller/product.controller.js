const slugify = require("slugify");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const productService = require("../services/product.services");

// create product
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      price,
      discountPrice,
      stock,
      material,
      plating,
      finish,
      occasion,
      variants,
      images,
      tags,
      isFeatured,
      seo,
    } = req.body;

    // Required fields validation
    if (!name || !description || !price || !category) {
      return next(new ErrorHandler("Missing required fields", 400));
    }

    // Auto-generate slug from product name
    const slug = slugify(name, { lower: true, strict: true });

    // Prepare product data
    const saveProduct = {
      name,
      slug,
      description,
      category,
      subCategory,
      price,
      discountPrice,
      stock,
      material,
      plating,
      finish,
      occasion,
      variants,
      images,
      tags,
      isFeatured: isFeatured || false,
      seo,
    };

    // Call service layer
    const addProduct = await productService.createProduct(saveProduct);

    return res.status(201).json({
      success: true,
      product: addProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// list all products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    // console.log("products", products);

    if (!products || products.length === 0)
      return next(new ErrorHandler("No products found", 404));

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
});

// get product based on slug
// exports.getProductSlug = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const product = await productService.getProductSlug(req.query);
//     if (!product || product.length === 0)
//       return next(new ErrorHandler("No products found", 404));

//     return res.status(200).json({
//       success: true,
//       count: products.length,
//       product,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// get product based on :id
exports.getProductById = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product || product.length === 0)
      return next(new ErrorHandler("No product found", 404));

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// update product using id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    if (!product || product.length === 0)
      return next(new ErrorHandler("No product found", 404));

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// delete product using id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const deleteProduct = await productService.deleteProduct(req.params.id);
    if (!deleteProduct || deleteProduct.length === 0)
      return next(new ErrorHandler("No product found", 404));

    res
      .status(200)
      .json({ success: true, message: "product deleted successfully" });
  } catch (error) {
    next(error);
  }
});

//
exports.uploadImages = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

  const imageUrls = req.files.images.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    url: baseUrl + file.filename,
  }));
  return res.status(200).send({ success: true, data: imageUrls });
});
