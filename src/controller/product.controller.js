const slugify = require("slugify");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const productService = require("../services/product.service");
const { cloudinary } = require("../utils/cloudinary");
const Image = require("../model/image.model");

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
      // slug,
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

// soft delete product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("No product found", 404));
    }
    const deleteProduct = await productService.softDeleteProduct(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "product deleted successfully" });
  } catch (error) {
    next(error);
  }
}); 
// delete product using id
exports.deleteProductHard = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("No product found", 404));
    }
    if (product.images && product.images.length > 0) {
      if (product.images.length > 1) {

        await cloudinary.api.delete_resources(
          product.images.map((image) => image.public_id)
        );

        await Image.deleteMany({
          _id: { $in: product.images.map((image) => image._id) },
        });
      } else {
        await cloudinary.uploader.destroy(product.images[0].public_id);

        await Image.deleteOne({ _id: product.images[0]._id });
      }
    } else {
      console.log("No images found, skipping deletion.");
    }
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


// user user list all product

exports.userGetAllTrendingProducts = catchAsyncErrors(async (req, res, next) => {
const productData = await productService.userGetAllTrendingProducts(req.query);
if(productData.length === 0){
    return next(new ErrorHandler("No products found",404))
}
return res.status(200).json({
    success:true,
    count:productData.total,
    products:productData.products
})  
});