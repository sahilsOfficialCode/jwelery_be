// OLD SCHEMA
// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     discountPrice: {
//       type: Number, // discounted price (if any)
//       default: null,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     brand: {
//       type: String,
//       required: true,
//     },
//     category: {
//       type: String, // e.g., "Mobiles", "Electronics", "Fashion"
//       required: true,
//     },
//     subCategory: {
//       type: String, // e.g., "Smartphones", "Men's Shoes"
//     },
//     colors: [
//       {
//         name: { type: String }, // e.g., "Red"
//         hexCode: { type: String }, // e.g., "#FF0000"
//       },
//     ],
//     sizes: [
//       {
//         type: String, // e.g., "S", "M", "L", "XL" for clothing OR "128GB" for mobiles
//       },
//     ],
//     images: [
//       {
//         url: { type: String }, // image link
//         alt: { type: String }, // alternative text
//       },
//     ],
//     ratings: {
//       average: { type: Number, default: 0 }, // average rating
//       count: { type: Number, default: 0 }, // total rating count
//     },
//     offers: [
//       {
//         title: { type: String }, // e.g., "10% Instant Discount with HDFC"
//         discountPercent: { type: Number },
//       },
//     ],
//     seller: {
//       name: { type: String, required: true },
//       contact: { type: String },
//     },
//     isActive: {
//       type: Boolean,
//       default: true, // to hide/show product
//     },
//   },
//   { timestamps: true }
// );

// const Product = mongoose.model("Product", productSchema);

// module.exports = Product

// NEW SCHEMA
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number }, // Final price after discount
  discountType: {
    type: String,
    enum: ["percentage", "flat"],
  },
  discountValue: { type: Number },
  stock: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [{ type: String }], //s3 urls
  material: { type: String },
  weight: { type: Number },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
