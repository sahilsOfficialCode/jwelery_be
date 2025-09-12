const express = require("express");
const router = express.Router();

const categoryController = require("../controller/category.controller");
const { userAuthentication } = require("../middleware/auth");

// create category
router.use(userAuthentication)
router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.get("/:id", categoryController.getCategoryById);
router.patch('/:id',categoryController.updateCategory);
router.delete('/:id',categoryController.deleteCategory);

module.exports = router;
