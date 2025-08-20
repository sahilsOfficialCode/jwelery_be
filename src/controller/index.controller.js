const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.getIndex = catchAsyncErrors(async(req, res, next)=>{
     res.render("index", { 
    title: "Home Page", 
    message: "Welcome to Ecommerce Project!", 
    tagline: "Fast · Secure · Reliable"
  });
})