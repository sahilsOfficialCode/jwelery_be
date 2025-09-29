const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cartService = require("../services/cart.service");
const ErrorHandler = require("../utils/errorHandler");

exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  try {
    const {status,data,message} =await cartService.addToCart(
      req.user._id,
      req.body.product,
      req.body.quantity
    );
    if(!status) return next(new ErrorHandler(message,404))
    res.status(200).json({ status, data,message });
  } catch (err) {
    next(err);
  }
});

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.json({ status: true, data: cart || { items: [], totalPrice: 0 } });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItem(
      req.user._id,
      req.body.productId,
      req.body.quantity
    );
    res.json({ status: true, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(
      req.user._id,
      req.params.productId
    );
    res.json({ status: true, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.deleteAllCart = async (req, res, next) => {
  try {
    const {status, data, message } = await cartService.deleteAllCart(req.user._id);
    if(!status){
      return next(new ErrorHandler(message,400))
    }
    res.status(200).send({ status: true, data: data });
  } catch (err) {
    next(err);
  }
};