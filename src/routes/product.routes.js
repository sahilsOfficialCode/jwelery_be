const express = require("express");
const productController = require("../controller/product.controller");
const upload = require("../middleware/upload");
const router = express.Router();

// create a product
router.post("/", productController.createProduct);

// get all products
router.get("/all", productController.getAllProducts);

// get single product using slug
// router.get("/slug/:slug", productController.getProductSlug);

// get single product using id.
router.get("/:id", productController.getProductById);

// update product
router.put("/:id", productController.updateProduct);

// delete product
router.delete("/:id", productController.deleteProduct);

router.post(
  "/upload",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "banner", maxCount: 1 },
  ]),
  productController.uploadImages
);

module.exports = router;
