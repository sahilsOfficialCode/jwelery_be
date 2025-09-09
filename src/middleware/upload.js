const multer = require("multer");
const path = require("path");

// // Storage config (saving in local storage for now)
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/"); 
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
//     );
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|webp/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.test(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only .jpeg, .jpg, .png, .webp allowed"));
//     }
//   },
// });


const storage = multer.memoryStorage(); // ✅ store file in memory, not disk

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, .png, .webp allowed"));
    }
  },
});


module.exports = upload;
