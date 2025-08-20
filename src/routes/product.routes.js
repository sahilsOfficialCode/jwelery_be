const express = require('express');
const productController = require('../controller/product.controller');
const upload = require('../middleware/upload');
const router = express.Router()

router.post("/", productController.createProduct);
router.post(
    "/upload",
    upload.fields([
        { name: "profile", maxCount: 1 },
        { name: "images", maxCount: 5 },
        { name: "banner", maxCount: 1 }
    ]),
    productController.uploadImages
);

module.exports = router