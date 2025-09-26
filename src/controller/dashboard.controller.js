// controller/dashboard.controller.js
const dashboardService = require("../services/dashboard.service");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { error } = require("qrcode-terminal");

// dashboard stats get api
exports.getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return next(
        new ErrorHandler("Please provide startDate and endDate", 400)
      );
    }

    const stats = await dashboardService.getDashboardStats(startDate, endDate);
    if (!stats) {
      return next(new ErrorHandler("No dashboard stats found", 404));
    }
    res.status(200).json({
      success: true,
      data: stats,
      message: "Dashboard stats fetched successfully",
    });
  } catch (error) {
    next(error);
  }
});

// get api for latest products
exports.getLatestProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await dashboardService.getLatestProducts();
    if (!products || products.length === 0) {
      return next(new ErrorHandler("No products found", 404));
    }

    res.status(200).json({
      success: true,
      data: products,
      message: "Latest products fetched successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get api for latest orders
exports.getLatestOrders = catchAsyncErrors(async (req, res, next) => {
  try {
    const orders = await dashboardService.getLatestOrders();
    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found", 404));
    }
    res.status(200).json({
      success: true,
      data: orders,
      message: "Latest orders fetched successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get api for revenue data
exports.getRevenueData = catchAsyncErrors(async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    if (!startDate || !endDate) {
      return next(
        new ErrorHandler("Please provide startDate and endDate", 400)
      );
    }
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
  } catch (error) {
    next(error);
  }
});
