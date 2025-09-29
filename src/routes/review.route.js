const express = require("express");
const reviewController= require("../controller/review.controller");
const { userAuthentication } = require("../middleware/auth");
const router = express.Router();

router.use(userAuthentication)
router.post("/",reviewController.createReview)


module.exports = router;