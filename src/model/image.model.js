const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    public_id: { type: String, required: true },   
    secure_url: { type: String, required: true },  
    format: { type: String },                      // jpg, png, pdf, etc.
    resource_type: { type: String, default: "image" }, // image / video / raw
    size: { type: Number },                        // file size in bytes
    folder: { type: String },                      // ecommerce/products, etc.
    color: { type: String },
    created_at: { type: Date, default: Date.now }, // when uploaded
  },
  { timestamps: true }
);

const Image = mongoose.model("images", imageSchema);
module.exports = Image;
