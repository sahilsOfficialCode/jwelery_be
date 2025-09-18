const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const categoryService = require("../services/category.service");
const { cloudinary } = require("../utils/cloudinary");
const Image = require("../model/image.model");

// create category
exports.createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, description, image } = req.body;

  if (!name) return next(new ErrorHandler("Missing required fields", 400));

  const categoryDetail = {
    name,
    description,
    image,
  };

  const addCategory = await categoryService.createCategory(categoryDetail);
  res
    .status(200)
    .json({
      success: true,
      category: addCategory,
      message: "category created successfully",
    });
});


exports.getAllCategory = catchAsyncErrors(async (req, res, next) => {
  let { page, limit, sortBy, order, search,data } = req.query;
  page = parseInt(page) || 1; 
  limit = parseInt(limit) || 10;
  sortBy = sortBy || "createdAt"; 
  order = order === "desc" ? -1 : 1; 

  const skip = (page - 1) * limit;

  let filter = {};
  filter.is_deleted = false
  filter.isActive = true
  if (search) {
    filter.name = { $regex: search, $options: "i" }; 
  }

  const total = await categoryService.countCategories(filter);

  const categories = await categoryService.getCategories({
    filter,
    skip,
    limit,
    sort: { [sortBy]: order },
  });

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    categories,
  });
});

exports.getCategoryById = catchAsyncErrors(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) return next(new ErrorHandler("No category found", 404));
  res.status(200).json({ success: true, category });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, description, image } = req.body;
  const categoryData = await categoryService.getCategoryById(req.params.id);
  if(categoryData.is_deleted){
    return next(new ErrorHandler("Category is deleted", 404));
  }
  if (!categoryData) return next(new ErrorHandler("No category found", 404));
  let category
  
  const imageId = categoryData.image?._id?.toString();

  if (imageId && imageId !== image) {
    await cloudinary.uploader.destroy(categoryData.image.public_id);
    await Image.deleteOne({ _id: categoryData.image._id });
    category = await categoryService.updateCategory(req.params.id, { name, description, image });
  } else {
    category = await categoryService.updateCategory(req.params.id, { name, description,image });
  }
  
  if (!category) return next(new ErrorHandler("No category found", 404));
  res.status(200).json({ success: true, category, message: "category updated successfully" });
});

// exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
//   const categoryData = await categoryService.getCategoryById(req.params.id);
//   if (!categoryData) return next(new ErrorHandler("No category found", 404));
//   if(categoryData.image){
//     await cloudinary.uploader.destroy(categoryData.image.public_id);
//     await Image.deleteOne({ _id: categoryData.image._id });
//   }
//   const category = await categoryService.deleteCategory(req.params.id);
//   if (!category) return next(new ErrorHandler("No category found", 404));
//   res.status(200).json({ success: true, category, message: "category deleted successfully" });
// });


// soft delete
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const categoryData = await categoryService.getCategoryById(req.params.id);
  if (!categoryData) return next(new ErrorHandler("No category found", 404));
  if(categoryData.is_deleted){
    return next(new ErrorHandler("Category is deleted", 404));
  }
  const category = await categoryService.softDeleteCategory(req.params.id);
  if (!category) return next(new ErrorHandler("No category found", 404));
  res.status(200).json({ success: true, category, message: "category deleted successfully" });
});