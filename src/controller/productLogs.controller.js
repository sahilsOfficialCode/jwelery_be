
const productLogsService = require("../services/productLogs.service");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.logEvent = catchAsyncErrors( async(req,res,next)=>{
  const { productId, event } = req.body;
  await productLogsService.logEvent(productId, event);
  res.sendStatus(204);
})