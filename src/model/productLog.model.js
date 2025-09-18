// models/ProductLog.js
const mongoose = require("mongoose");

const productLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  event:   { type: String, enum: ["view", "add_to_cart", "purchase"], required: true },
  sessionId: { type: String },   
  ip: { type: String },      
  userAgent: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

const ProductLogs = mongoose.model("ProductLog", productLogSchema);
module.exports = ProductLogs