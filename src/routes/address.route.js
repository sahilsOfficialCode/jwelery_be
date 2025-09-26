const express = require("express");
const router = express()
const addressController = require("../controller/address.controller");
const { userAuthentication } = require("../middleware/auth");

router.use(userAuthentication)
router.post("/",addressController.addAddress);
router.get("/",addressController.getAllAddresses)
router.delete("/:id",addressController.deleteAddress)
router.put("/:id",addressController.updateAddress);

module.exports = router
