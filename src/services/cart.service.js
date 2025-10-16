const Cart = require("../model/Cart.model");
const Product = require("../model/product.model");
const ErrorHandler = require("../utils/errorHandler");

// exports.addToCart = async (userId, productId, quantity) => {
//   const product = await Product.findById(productId);
//   if (!product)
//     return { status: false, data: product, message: "Product not found" };

//   let cart = await Cart.findOne({ user: userId });
//   if (!cart) {
//     cart = new Cart({ user: userId, items: [], totalPrice: 0 });
//   }

//   const itemIndex = cart.items.findIndex(
//     (item) => item.product.toString() === productId
//   );

//   if (itemIndex > -1) {
//     cart.items[itemIndex].quantity += quantity;
//   } else {
//     cart.items.push({
//       product: productId,
//       quantity,
//       price: product.price - (product.discountPrice || 0),
//       // product.price - (product.price * product.discountPrice) / 100 ||
//       // product.price,
//     });
//   }

//   cart.totalPrice = Math.round(
//     cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)
//   );
//   const cartAdd = await cart.save();
//   return {
//     status: true,
//     data: cartAdd,
//     message: "Item added to cart successfully",
//   };
// };

exports.addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product)
    return { status: false, data: null, message: "Product not found" };

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [], totalPrice: 0 });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  const finalPrice = product.price - (product.discountPrice || 0);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    // cart.items.push({
    //   product: productId,
    //   quantity,
    //   price:
    //     product.price - (product.price * product.discountPrice) / 100 ||
    //     product.price,
    // });

    cart.items.push({
      product: productId,
      quantity,
      price:
        product.discountPrice || product.price,
    });
  }

  // recalculate total
  cart.totalPrice = Math.round(
    // cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)
    cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0 );
  )
  const cartAdd = await cart.save();
  return {
    status: true,
    data: cartAdd,
    message: "Item added to cart successfully",
  };
};

exports.getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: { path: "images" },
    })
    .lean();

  if (!cart) return null;

  return {
    ...cart,
    totalCount: cart.items?.length || 0,
  };
};

exports.countCartDocuments = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).lean();
  return cart ? cart.items.length : 0;
};

exports.updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ErrorHandler("Cart not found", 404);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ErrorHandler("Product not in cart", 404);

  item.quantity = quantity;
  // cart.totalPrice = cart.items.reduce(
  //   (acc, i) => acc + i.quantity * i.price,
  //   0
  // );
  cart.totalPrice = cart.items.reduce(
    (acc, i) => acc + i.quantity * i.discountPrice,
    0
  );

  return await cart.save();
};

exports.removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ErrorHandler("Cart not found", 404);

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  // cart.totalPrice = cart.items.reduce(
  //   (acc, i) => acc + i.quantity * i.price,
  //   0
  // );
   cart.totalPrice = cart.items.reduce(
    (acc, i) => acc + i.quantity * i.discountPrice,
    0
  );

  return await cart.save();
};

exports.deleteAllCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (cart.items.length === 0)
    return {
      status: false,
      data: cart,
      message: "There are no products in your cart",
    };
  cart.items = [];
  cart.totalPrice = 0;
  const cartUpdate = await cart.save();
  return {
    status: true,
    data: cartUpdate,
    message: "All items removed from cart successfully",
  };
};