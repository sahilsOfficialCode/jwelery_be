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

exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    let { page, limit, sortBy, order, search, role, isVerified } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sortBy = sortBy || "createdAt";
    order = order === "desc" ? -1 : 1;
  
    const skip = (page - 1) * limit;
  
    let filter = { is_deleted: false };
  
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }
  
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";
  
    const total = await userService.countUsers(filter);
  
    const users = await userService.getUsers({
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
      users,
    });
  });
  
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

exports.updateUser = catchAsyncErrors(async(req, res, next)=>{
    const { role, 
        is_blocked } = req.body 
    const updateUser = await userService.updateUser(req.params.id,{role,is_blocked})
    if(!updateUser){
        return next(new ErrorHandler("No user found",404))
    }
    res.status(200).json({success:true,data:updateUser})
})
