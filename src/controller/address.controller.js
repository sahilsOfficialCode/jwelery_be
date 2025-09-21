const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { addAddressService, getAllAddressesService, deleteAddressService, updateAddressService } = require("../services/address.service");
const ErrorHandler = require("../utils/errorHandler");

exports.addAddress = catchAsyncErrors( async(req,res,next)=>{
   const {status,data,message} = await addAddressService(req.body,req.user._id);
        if(!status) return next(new ErrorHandler(message,400))
        return res.status(200).send({success:true,data,message})
})


exports.getAllAddresses = catchAsyncErrors( async(req,res,next)=>{
        const {status, data, message} = await getAllAddressesService(req.user._id);
        if(!status) return next(new ErrorHandler(message,400))
        return res.status(200).json({success:true,data,
            message: "Addresses fetched successfully"
        });
})
exports.deleteAddress = catchAsyncErrors(async(req,res,next)=>{
    const { id } = req.params;
        const {status,data,message} = await deleteAddressService(id);
         if(!status) return next(new ErrorHandler(message,400))
        return res.status(200).json({ success:true,data,
            message: "Address deleted successfully",
            
        });
})

exports.updateAddress = catchAsyncErrors( async(req,res,next)=>{
     const { id } = req.params;
        const updateData = req.body;
        const {status,data,message} = await updateAddressService(id, updateData);
         if(!status) return next(new ErrorHandler(message,400))
        return res.status(200).json({ success:true,
            message: "Address updated successfully",
            data:data
        });
})
