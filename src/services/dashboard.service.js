// services/dashboard.service.js
const Order = require("../model/Order.model");
const Product = require("../model/product.model");

// Compute dashboard stats
exports.getDashboardStats = async (startDate, endDate) => {
  const from = startDate ? new Date(startDate) : new Date("1970-01-01");
  const to = endDate ? new Date(endDate) : new Date();

  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: from, $lte: to },
  });

  const totalSales = await Order.countDocuments({
    createdAt: { $gte: from, $lte: to },
    "payment.status": "paid",
  });

  // total revenue (sum of paid orders)
  const revenueAgg = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        "payment.status": "paid",
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  // total customers (unique user IDs in orders)
  const customersAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: "$user" } },
    { $count: "uniqueCustomers" },
  ]);
  const totalCustomers =
    customersAgg.length > 0 ? customersAgg[0].uniqueCustomers : 0;

  return { totalSales, totalOrders, totalRevenue, totalCustomers };
};

//  Latest products
exports.getLatestProducts = async (limit = 5) => {
  return Product.find().sort({ createdAt: -1 }).limit(limit);
};

// Latest orders
// exports.getLatestOrders = async (limit = 5) => {
//   return Order.find().sort({ createdAt: -1 }).limit(limit);
// };

exports.getLatestOrders = async (limit = 5) => {
  return Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: "items.product",
      select: "name price images category",
      populate: [{ path: "category", select: "name" }, { path: "images" }],
    });
};

// Revenue grouped by date
exports.getRevenueData = async (startDate, endDate, groupBy = "day") => {
  const from = startDate ? new Date(startDate) : new Date("1970-01-01");
  const to = endDate ? new Date(endDate) : new Date();

  const groupFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

  const revenueData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        "payment.status": "paid",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return revenueData;
};
