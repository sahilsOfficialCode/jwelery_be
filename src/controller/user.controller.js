const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const userService = require("../services/user.service");

exports.createUser = catchAsyncErrors(async(req, res, next)=>{
    const {email, password, name } = req.body 
    const emailExist = await userService.getUserByEmail(email)
    if(emailExist){
        return next(new ErrorHandler("Email already exists",400))
    }
    if(!email || !password || !name){
        return next(new ErrorHandler("Please fill all fields",400))
    }
    const userDetail = {
        name,
        email,
        password
    } 
    const createUser = await userService.createUser(userDetail)
    res.status(200).json({success:true,data:createUser})
})

exports.getAllUser = catchAsyncErrors(async(req, res, next)=>{
    const getAllUser = await userService.getAllUser()
    if(!getAllUser){
        return next(new ErrorHandler("No user found",404))
    }
    res.status(200).json({success:true,data:getAllUser})
})

exports.getUserById = catchAsyncErrors(async(req, res, next)=>{
    const getUserById = await userService.getUserById(req.params.id)
    if(!getUserById){
        return next(new ErrorHandler("No user found",404))
    }
    res.status(200).json({success:true,data:getUserById})
})

exports.deleteUser = catchAsyncErrors(async(req, res, next)=>{
    const deleteUser = await userService.deleteUser(req.params.id)
    if(!deleteUser){
        return next(new ErrorHandler("No user found",404))
    }
    res.status(200).json({success:true,data:deleteUser})
})
