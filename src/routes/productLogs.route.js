const express = require("express");
const router = express.Router();
const productLogsController = require("../controller/productLogs.controller");

router.post("/",productLogsController.logEvent)

module.exports = router;