const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true, // allow users without email if they register with mobile only
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["local", "google", "whatsapp"],
      default: "local",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date, default:Date.now() },
    },
    expireAt: {
      type: Date,
      index: { expires: 0 },
    },
    is_deleted:{
      type:Boolean,
      default:false
    },
    is_blocked:{
      type:Boolean,
      required:true,
      default:false
    },
    is_register:{
      type:Boolean,
      default:false
    },
    is_deleted:{
      type:Boolean,
      default:false
    },
    isActive:{
      type:Boolean,
      default:true
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
