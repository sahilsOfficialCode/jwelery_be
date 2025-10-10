const orderService = require("../services/orderService");
const cartService = require("../services/cart.service");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (items.length === 0) return next(new ErrorHandler("items field missing"))
    if (!shippingAddress) return next(new ErrorHandler("shippingAddress field missing"))
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
    if (!razorpay_order_id) return next(new ErrorHandler("shippingAddress field missing"));
    if (!razorpay_payment_id) return next(new ErrorHandler("razorpay_payment_id field missing"));
    if (!razorpay_signature) return next(new ErrorHandler("razorpay_signature field missing"));

    const { status, order } = await orderService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (status) {
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
    res.status(200).send({ status: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.getAllUserOrder = async(req, res, next)=>{
   try {
    const orders = await orderService.getAllUserOrders(req.query)
    res.status(200).send({ status: true, orders });
  } catch (err) {
    next(err);
  }
}

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


// admin change order status
exports.changeOrderStatus = catchAsyncErrors(async (req, res,next) => {
  const { orderId } = req.params
  console.log("<><>req.body",req.body)
  if(!req.body.status) return next(new ErrorHandler("status required",404))
  const order = await orderService.changeOrderStatus(orderId, req.body.status);
  res.json({ status: true, order });
})

exports.adminCreateOrder = catchAsyncErrors( async(req,res,next)=>{
  const {items, shippingAddress} = req.body
  const orderData = await orderService.adminCreateOrderService(req.user._id,items,shippingAddress)
  res.json({ status: true, orderData });
})

