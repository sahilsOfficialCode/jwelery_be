const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const reviewService = require("../services/review.service");
const ErrorHandler = require("../utils/errorHandler");

exports.createReview = catchAsyncErrors( async(req,res,next)=>{
     const {status,data,message} = await reviewService.createReview({
      userId: req.user._id,
      ...req.body
    });
    if(!status) return next(new ErrorHandler(message,400))
    res.status(201).json({ success: true, message });
})

exports.updateReview = catchAsyncErrors( async(req,res,next)=>{
    const review = await reviewService.updateReview(req.params.id, req.user._id, req.body);
    res.json({ success: true, review });
})

exports.deleteReview = catchAsyncErrors( async(req,res,next)=>{
    const review = await reviewService.deleteReview(req.params.id, req.user._id);
    res.json({ success: true, review });
})

exports.getReviews = catchAsyncErrors( async(req,res,next)=>{
     const { page, limit, sort } = req.query;
    const data = await reviewService.getReviews(req.params.productId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: sort || "-createdAt"
    });
    res.json({ success: true, ...data });
})

exports.getRatingSummary = catchAsyncErrors( async(req,res,next)=>{
    const summary = await reviewService.getRatingSummary(req.params.productId);
    res.json({ success: true, summary });
})
exports.addReply = catchAsyncErrors( async (req,res,next)=>{
    const { comment } = req.body;
    const review = await reviewService.addReply(req.params.id, req.user._id, comment);
    res.json({ success: true, review });
})
