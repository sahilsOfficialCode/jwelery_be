const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  const {} = req.body;
});
