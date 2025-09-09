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

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },

    description: { type: String, required: true },

    category: { type: String, required: true }, // e.g. Earrings, Necklace, Bangles
    subCategory: { type: String }, // e.g. "Jhumka Earrings"

    material: { type: String }, // Brass, Alloy, German Silver
    plating: { type: String }, // Oxidised Silver, Rose Gold Plated
    finish: { type: String }, // Matte, Glossy, Antique

    occasion: [String], // e.g. ["Daily Wear", "Party", "Wedding"]

    price: { type: Number, required: true },
    discountPrice: { type: Number }, // after discount

    stock: { type: Number, default: 0 },

    images: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "images"
    }],

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    tags: [String], // e.g. ["oxidised", "party wear"]

    isFeatured: { type: Boolean, default: false },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
