const express = require("express");
const productController = require("../controller/product.controller");
const upload = require("../middleware/upload");
const { userAuthentication } = require("../middleware/auth");
const router = express.Router();


// users get All products
router.get("/trending-products", productController.userGetAllTrendingProducts);
router.get("/:id", productController.getProductById);

router.use(userAuthentication)
// Admin section
router.post("/", productController.createProduct);
// get all products
router.get("/all", productController.getAllProducts);
// get single product using slug
// router.get("/slug/:slug", productController.getProductSlug);
// get single product using id.
// update product
router.put("/:id", productController.updateProduct);
// delete product
router.delete("/:id", productController.deleteProduct);
module.exports = router;
