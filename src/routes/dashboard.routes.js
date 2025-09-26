// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboard.controller");
const { userAuthentication, authorizeRoles } = require("../middleware/auth");

// all dashboard endpoints require authentication & admin role
router.use(userAuthentication, authorizeRoles("admin"));

router.get("/stats", dashboardController.getDashboardStats);
router.get("/latest-products", dashboardController.getLatestProducts);
router.get("/latest-orders", dashboardController.getLatestOrders);
router.get("/revenue", dashboardController.getRevenueData);

module.exports = router;
