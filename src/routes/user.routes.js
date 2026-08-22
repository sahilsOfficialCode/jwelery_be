const express = require("express");
const userController= require("../controller/user.controller");
const { userAuthentication, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.use(userAuthentication)
// user own profile update
router.get("/profile", userController.getUserOwnProfile);
router.put("/profile", userController.updateUserOwnProfile);


router.post("/", authorizeRoles("admin"), userController.createUser);
router.get("/", authorizeRoles("admin"), userController.getAllUser);
router.get("/:id", authorizeRoles("admin"), userController.getUserById);
router.delete("/:id", authorizeRoles("admin"), userController.deleteUser);
router.patch("/:id", authorizeRoles("admin"), userController.updateUser);




module.exports = router;