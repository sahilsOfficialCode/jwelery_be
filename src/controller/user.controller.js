const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const userLogin = catchAsyncErrors(async(req, res, next)=>{
    const {email, password } = req.body
    
})