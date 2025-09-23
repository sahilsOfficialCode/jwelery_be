const orderService = require("../services/orderService");
const cartService = require("../services/cart.service")

// create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    const { order, razorpayOrder } = await orderService.createOrder(
      req.user._id,
      items,
      shippingAddress
    );
    res.status(201).json({ status: true, order, razorpayOrder });
  } catch (err) {
    next(err);
  }
};

// verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const {status,order} = await orderService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if(status){
      await cartService.deleteAllCart(req.user._id)
    }
    res.json({ status: true, order });
  } catch (err) {
    next(err);
  }
};

// get all orders of logged-in user
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);
    res.json({ status: true, orders });
  } catch (err) {
    next(err);
  }
};

// cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.user._id,
      req.params.orderId
    );
    res.json({ status: true, order });
  } catch (err) {
    next(err);
  }
};
