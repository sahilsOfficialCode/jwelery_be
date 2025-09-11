const WishList = require("../model/WishList.model");
const ErrorHandler = require("../utils/errorHandler");

// add to wish list api
exports.addToWishList = async (userId, productId) => {
  let wishList = await WishList.findOne({ user: userId });
  if (!wishList) {
    wishList = new WishList({ user: userId, products: [] });
  }

  if (!wishList.products.includes(productId)) {
    wishList.products.push(productId);
  }

  return await wishList.save();
};

// remove from wish list api
exports.removeFromWishList = async (userId, productId) => {
  const wishList = await WishList.findOne({ user: userId });

  if (!wishList) throw new ErrorHandler("Wishlist not found", 404);

  wishList.products = wishList.products.filter(
    (id) => id.toString() !== productId
  );

  return await wishList.save();
};

exports.getWishList = async (userId) => {
  return await WishList.findOne({ user: userId }).populate("products");
};
