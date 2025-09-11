const express = require("express");
const imageController = require("../controller/image.controller");
const upload = require("../middleware/upload");
const router = express.Router();

router.post(
  "/upload",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "banner", maxCount: 1 },
  ]),
  imageController.uploadImages
);

router.delete("/delete/:id", imageController.deleteImage);

module.exports = router;
