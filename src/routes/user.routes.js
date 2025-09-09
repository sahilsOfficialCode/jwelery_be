const express = require("express");
const userController= require("../controller/user.controller");
const router = express.Router();

router.post("/", userController.createUser);
router.get("/", userController.getAllUser);
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);
router.patch("/:id", userController.updateUser);



module.exports = router;