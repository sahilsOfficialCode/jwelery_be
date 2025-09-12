const express = require("express");
const userController= require("../controller/user.controller");
const { userAuthentication } = require("../middleware/auth");
const router = express.Router();

router.use(userAuthentication)
router.post("/", userController.createUser);
router.get("/", userController.getAllUser);
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);
router.patch("/:id", userController.updateUser);



module.exports = router;