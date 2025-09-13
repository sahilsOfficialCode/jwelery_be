const wishListService = require("../services/wishList.service");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.addToWishList = catchAsyncErrors(async (req, res, next) => {
  try {
    const wishList = await wishListService.addToWishList(
      req.user._id,
      req.body.productid
    );
    res.json({ status: true, data: wishList });
  } catch (err) {
    next(err);
  }
});

exports.removeFromWishList = catchAsyncErrors(async (req, res, next) => {
  try {
    const wishList = await wishListService.removeFromWishList(
      req.user._id,
      req.params.productid
    );
    res.json({ status: true, data: wishList });
  } catch (err) {
    next(err);
  }
});

exports.getWishList = catchAsyncErrors(async (req, res, next) => {
  try {
    const wishList = await wishListService.getWishList(req.user._id);
    res.json({ status: true, data: wishList });
  } catch (err) {
    next(err);
  }
});
