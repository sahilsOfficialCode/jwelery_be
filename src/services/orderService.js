const Order = require("../model/Order.model");
const ErrorHandler = require("../utils/errorHandler");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order & save our Order
exports.createOrder = async (userId, items, shippingAddress) => {
  const totalAmount = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // create Razorpay order
  const options = {
    // Razorpay expects paise
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    totalAmount,
    payment: {
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    },
  });

  return { order, razorpayOrder };
};

// Verify payment after Razorpay returns
exports.verifyPayment = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ErrorHandler("Payment verification failed", 400);
  }

  // Update order as paid
  const order = await Order.findOneAndUpdate(
    { "payment.razorpayOrderId": razorpayOrderId },
    {
      $set: {
        "payment.razorpayPaymentId": razorpayPaymentId,
        "payment.razorpaySignature": razorpaySignature,
        "payment.status": "paid",
      },
      orderStatus: "confirmed",
    },
    { new: true }
  );

  if (!order) throw new ErrorHandler("Order not found", 404);

  return {status:true,order};
};

// get user orders
exports.getUserOrders = async (userId) => {
  const data =  await Order.find({ user: userId })
  .populate({
    path: "items.product",
    model: "Product",
    populate: {
      path: "images",            // populate images inside product
      model: "images",           // note: model name must match your Image model
    },
  });
  console.log("<><>data",data)
  return data
};

// cancel order before shipped
exports.cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ErrorHandler("Order not found", 404);

  if (["shipped", "delivered"].includes(order.orderStatus)) {
    throw new ErrorHandler("Cannot cancel shipped/delivered order", 400);
  }

  order.orderStatus = "cancelled";
  await order.save();
  return order;
};
