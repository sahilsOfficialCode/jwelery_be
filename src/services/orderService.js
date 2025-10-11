const OrderModel = require("../model/Order.model");
const Order = require("../model/Order.model");
const Product = require("../model/product.model");
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

  return { status: true, order };
};

// get user orders
exports.getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).populate({
    path: "items.product",
    model: "Product",
    populate: {
      path: "images", // populate images inside product
      model: "images", // note: model name must match your Image model
    },
  });
};

// get user orders
exports.getAllUserOrders = async (query) => {
  try {
    const {
      search, // search by name, phone, notes
      status, // filter by orderStatus
      payment_status, // filter by payment.status
      start_date, // filter by createdAt >= start_date
      end_date, // filter by createdAt <= end_date
      userId, // optional: filter by user
      page = 1,
      limit = 10,
      sort_by = "createdAt",
      order = "desc",
    } = query;

    const isFetchAll = limit === "all";
    const pageNum = parseInt(page) || 1;
    const limitNum = isFetchAll ? 0 : parseInt(limit) || 10;
    const skip = isFetchAll ? 0 : (pageNum - 1) * limitNum;

    // 🔹 Filters
    const filters = {};

    if (status) filters.orderStatus = status;
    if (payment_status) filters["payment.status"] = payment_status;
    if (userId) filters.user = userId;

    if (start_date || end_date) {
      filters.createdAt = {};
      if (start_date) filters.createdAt.$gte = new Date(start_date);
      if (end_date) filters.createdAt.$lte = new Date(end_date);
    }

    if (search) {
      filters.$or = [
        { "shippingAddress.name": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 Query builder
    let queryBuilder = Order.find(filters)
      .populate({
        path: "items.product",
        populate: { path: "images", model: "images" },
      })
      .populate("user", "name email")
      .sort({ [sort_by]: order === "asc" ? 1 : -1 })
      .lean();

    if (!isFetchAll) {
      queryBuilder = queryBuilder.skip(skip).limit(limitNum);
    }

    const result = await queryBuilder.exec();

    // 🔹 Total count
    const total = await Order.countDocuments(filters);

    return {
      status: true,
      data: {
        result,
        total,
        page: isFetchAll ? 1 : pageNum,
        limit: isFetchAll ? total : limitNum,
      },
      message: "Orders fetched successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: `Something went wrong. (${error.message})`,
    };
  }
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

exports.updateOrderStatus = async (orderId, newStatus) => {
  const validStatuses = [
    "placed",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ErrorHandler("Invalid order status", 400);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ErrorHandler("Order not found", 404);

  order.orderStatus = newStatus;
  await order.save();

  return order;
};

// cancel order before shipped
exports.changeOrderStatus = async (orderId, status) => {
  const order = await OrderModel.findOne({ _id: orderId });
  if (!order) throw new ErrorHandler("Order not found", 404);
  if (["shipped", "delivered"].includes(order.orderStatus)) {
    throw new ErrorHandler("Cannot change shipped/delivered order", 400);
  }
  order.orderStatus = status;
  await order.save();
  return order;
};

// Admin creates order without payment integration
exports.adminCreateOrderService = async (userId, items, shippingAddress) => {
  try {
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // Optional: Check available stock
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product: ${product.name} (Available: ${product.stock})`
        );
      }
    }
    const totalAmount = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

    // Create order directly without Razorpay
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      totalAmount,
      payment: {
        status: "paid",
        method: "admin",
      },
      createdBy: "admin",
    });

    return { order };
  } catch (error) {
    console.error("Error creating admin order:", error);
    throw new Error("Could not create order");
  }
};

exports.adminUpdateOrderService = async (orderId, updateData) => {
  try {
    // Destructure fields that can be updated
    const { items, shippingAddress, paymentStatus, paymentMethod } = updateData;

    // Calculate total amount if items are updated
    let totalAmount;
    if (items && Array.isArray(items)) {
      totalAmount = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    }

    // Prepare update object
    const updateFields = {
      ...(items && { items }),
      ...(shippingAddress && { shippingAddress }),
      ...(totalAmount && { totalAmount }),
      ...(paymentStatus && { "payment.status": paymentStatus }),
      ...(paymentMethod && { "payment.method": paymentMethod }),
      updatedAt: new Date(),
    };

    // Update order in DB
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, {
      new: true,
    });

    if (!updatedOrder) {
      throw new Error("Order not found");
    }

    return { order: updatedOrder };
  } catch (error) {
    console.error("Error updating admin order:", error);
    throw new Error("Could not update order");
  }
};
