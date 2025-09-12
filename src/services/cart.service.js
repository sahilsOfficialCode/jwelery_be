const Cart = require("../model/Cart.model");
const Product = require("../model/product.model");
const ErrorHandler = require("../utils/errorHandler");

exports.addToCart = async (userId, productId, quantity) => {
  console.log(productId);
  const product = await Product.findById(productId);
  console.log("product", product);
  if (!product) throw new ErrorHandler("Product not found", 404);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [], totalPrice: 0 });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price - (product.price * product.discountPrice / 100) || product.price,
    });
  }

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  return await cart.save();
};

exports.getCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate({path: "items.product",populate: { path: "images" }});
};

exports.updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ErrorHandler("Cart not found", 404);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ErrorHandler("Product not in cart", 404);

  item.quantity = quantity;
  cart.totalPrice = cart.items.reduce(
    (acc, i) => acc + i.quantity * i.price,
    0
  );

  return await cart.save();
};

exports.removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ErrorHandler("Cart not found", 404);

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  cart.totalPrice = cart.items.reduce(
    (acc, i) => acc + i.quantity * i.price,
    0
  );

  return await cart.save();
};

exports.deleteAllCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ErrorHandler("Cart not found", 404);
  cart.items = [];
  cart.totalPrice = 0;
  return await cart.save();
};