const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // slug: { type: String, unique: true, lowercase: true, index: true },

    description: { type: String, required: true },

    category: { type: mongoose.Schema.Types.ObjectId,ref:"Category", required: true }, // e.g. Earrings, Necklace, Bangles
    subCategory: { type: String }, // e.g. "Jhumka Earrings"
    status:{type:String,default:"active"},
    material: { type: String }, // Brass, Alloy, German Silver
    plating: { type: String }, // Oxidised Silver, Rose Gold Plated
    finish: { type: String }, // Matte, Glossy, Antique

    occasion: [String], // e.g. ["Daily Wear", "Party", "Wedding"]

    price: { type: Number, required: true },
    discountPrice: { type: Number }, // after discount

    stock: { type: Number, default: 0 },

    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "images",
      },
    ],

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
    isActive: {
      type: Boolean,
      default: true,
    },
    is_deleted:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
