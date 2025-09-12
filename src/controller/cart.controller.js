const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cartService = require("../services/cart.service");

exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(
      req.user._id,
      req.body.product,
      req.body.quantity
    );
    res.json({ status: true, data: cart });
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
