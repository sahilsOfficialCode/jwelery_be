const express = require("express");
const router = express.Router();
const wishlistController = require("../controller/wishList.controller");

router.post("/add", wishlistController.addToWishList);
router.delete("/remove/:productId", wishlistController.removeFromWishList);
router.get("/", wishlistController.getWishList);

module.exports = router;
