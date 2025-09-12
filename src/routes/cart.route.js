const express = require("express");
const router = express.Router();
const cartController = require("../controller/cart.controller");
const { userAuthentication } = require("../middleware/auth");

router.use(userAuthentication);
router.post("/add", cartController.addToCart);
router.get("/", cartController.getCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:productId", cartController.removeFromCart);

module.exports = router;
