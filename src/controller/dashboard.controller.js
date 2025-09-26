// controller/dashboard.controller.js
const dashboardService = require("../services/dashboard.service");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// dashboard stats get api
exports.getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const stats = await dashboardService.getDashboardStats(startDate, endDate);
  res.status(200).json({
    success: true,
    data: stats,
    message: "Dashboard stats fetched successfully",
  });
});

// get api for latest products
exports.getLatestProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await dashboardService.getLatestProducts();
  res.status(200).json({
    success: true,
    data: products,
    message: "Latest products fetched successfully",
  });
});

// Get api for latest orders
exports.getLatestOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await dashboardService.getLatestOrders();
  res.status(200).json({
    success: true,
    data: orders,
    message: "Latest orders fetched successfully",
  });
});

// Get api for revenue data
exports.getRevenueData = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, groupBy } = req.query;
  const data = await dashboardService.getRevenueData(
    startDate,
    endDate,
    groupBy
  );
  res.status(200).json({
    success: true,
    data,
    message: "Revenue data fetched successfully",
  });
});
