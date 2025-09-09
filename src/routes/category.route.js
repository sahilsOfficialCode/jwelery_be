const express = require("express");
const router = express.Router();

const categoryController = require("../controller/category.controller");

// create category
router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.get("/:id", categoryController.getCategoryById);
router.patch('/:id',categoryController.updateCategory);
router.delete('/:id',categoryController.deleteCategory);

module.exports = router;
