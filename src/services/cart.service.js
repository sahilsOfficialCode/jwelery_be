const Cart = require("../model/Cart.model");
const Product = require("../model/Product.model");

exports.addToCart = async (userId, productId, quantity) => {
  const product = Product.findById(productId);
  if (!product) return next(ne);
};
