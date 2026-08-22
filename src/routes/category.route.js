const express = require("express");
const router = express.Router();

const categoryController = require("../controller/category.controller");
const { userAuthentication, authorizeRoles } = require("../middleware/auth");

// create category

router.get("/", categoryController.getAllCategory);
router.use(userAuthentication, authorizeRoles("admin"));
router.post("/", categoryController.createCategory);
router.get("/:id", categoryController.getCategoryById);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
