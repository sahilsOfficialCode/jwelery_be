const express = require("express");
const router = express.Router();
const wishlistController = require("../controller/wishList.controller");
const { userAuthentication } = require("../middleware/auth");

router.use(userAuthentication);
router.post("/add", wishlistController.addToWishList);
router.delete("/remove/:productId", wishlistController.removeFromWishList);
router.get("/", wishlistController.getWishList);

module.exports = router;
