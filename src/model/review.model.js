const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: { 
      type: String,
      trim: true
    },
    comment: { 
      type: String,
      trim: true 
    },
    images: [
      {
        url: String,
        alt: String
      }
    ],
    reply: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin/seller who replies
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    helpfulCount: { type: Number, default: 0 },
    tags: [{ type: String }] // optional tags, e.g., "fast delivery", "high quality"
  },
  { timestamps: true }
);

// Optional: prevent duplicate review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
