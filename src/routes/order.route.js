const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const { userAuthentication } = require("../middleware/auth");

router.use(userAuthentication)
router.post("/create", orderController.createOrder);
router.post("/verify-payment", orderController.verifyPayment);
router.get("/", orderController.getUserOrders);
router.put("/cancel/:orderId", orderController.cancelOrder);

module.exports = router;
