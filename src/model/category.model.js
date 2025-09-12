const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: { type: String },
  image: { type: mongoose.Schema.Types.ObjectId, ref: "images" },
  createdAt: { type: Date, default: Date.now },
  isActive:{type:Boolean,default:true},
  is_deleted:{type:Boolean,default:false}
});

module.exports = mongoose.model("Category", categorySchema);
