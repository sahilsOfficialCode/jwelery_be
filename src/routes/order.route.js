const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const { userAuthentication, authorizeRoles } = require("../middleware/auth");

router.use(userAuthentication);
router.post("/create", orderController.createOrder);
router.post("/verify-payment", orderController.verifyPayment);
router.get("/", orderController.getUserOrders);
router.get("/list",authorizeRoles("admin"), orderController.getAllUserOrder);
router.post("/",authorizeRoles("admin"),orderController.adminCreateOrder);
router.put("/:orderId",authorizeRoles("admin"),orderController.changeOrderStatus);
router.put("/cancel/:orderId", orderController.cancelOrder);
router.put(
  "/status/:orderId",
  authorizeRoles("admin"),
  orderController.changeOrderStatus
);
module.exports = router;
