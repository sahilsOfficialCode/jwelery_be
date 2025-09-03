const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const categoryService = require("../services/category.service");

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
