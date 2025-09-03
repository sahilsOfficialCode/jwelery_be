const express = require("express");
const router = express.Router();

const categoryController = require("../controller/category.controller");

// create category
router.post("/", categoryController.createCategory);

module.exports = router;
