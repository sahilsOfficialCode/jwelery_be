const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorHandler");
const { client, isReady } = require("../utils/whatsappClient");
const { updateOtpWithMobile, verifyOtpWithMobile, sendEmailFunService } = require("../services/authService");
const User = require("../model/user.model");
const bcrypt = require('bcrypt')

exports.googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

exports.googleCallback = (req, res) => {
    const token = jwt.sign({ _id: req.user._id, email: req.user.email, role: req.user.role, provider: req.user.provider }, process.env.JWT_SECRET, { expiresIn: '30d' });
    sendToken(token, 200, res);
};

exports.userLoginWithCode = catchAsyncErrors(async (req, res, next) => {
    console.log("<><>req.qury", req.query);
})

exports.userLogout = catchAsyncErrors(async (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) return next(err);

            res.clearCookie("connect.sid");
            res.status(200).json({
                status: true,
                message: "Logged out successfully"
            });
        });
    });
})

exports.loginWithMobileOrEmail = catchAsyncErrors(async (req, res, next) => {
    const { username } = req.body
    let loginType = "";
    if (/^\S+@\S+\.\S+$/.test(username)) {
        loginType = "email";
    } else if (/^\d{10}$/.test(username)) {
        if (!isReady()) {
            return next(new ErrorHandler("WhatsApp client not ready. Try again in a few seconds.", 500));
        }
        try {
            const otp = generateOTP()
            const saveNumber = await updateOtpWithMobile(username, otp)
            if (!saveNumber.status) {
                return next(new ErrorHandler(saveNumber.message, 500))
            }
            const result = await client.sendMessage(
                `${username}@c.us`,
                `Your OTP code is: ${otp}`
            );
            console.log("✅ OTP sent:", result.id.id);

            // Store OTP somewhere (session/db/redis)
            return res.json({ status: true, message: "OTP sent successfully", type: loginType });
        } catch (err) {
            console.error("❌ Error sending OTP:", err);
            return next(new ErrorHandler("Failed to send OTP", 500));
        }


    } else {
        return next(new ErrorHandler("Invalid email or mobile format", 400))
    }
    return res.send({ data: req.body, type: loginType })
})

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
    const { mobile,email, otp } = req.body
    let otpVerify 
    if(mobile){
        otpVerify = await verifyOtpWithMobile("mobile",mobile, otp)
    }
    if(email){
         otpVerify = await verifyOtpWithMobile("email",email, otp)
    }
     

    if (!otpVerify.status) {
        return next(new ErrorHandler(otpVerify.message, 500));
    }
    if (!otpVerify) {
        return next(new ErrorHandler(otpVerify.message, 500));
    }
    const token = jwt.sign({ _id: otpVerify.data._id, mobile: otpVerify.data.mobile, role: otpVerify.data.role, provider: otpVerify.data.provider }, process.env.JWT_SECRET, { expiresIn: '30d' });
    sendToken(token, 200, res);
    return res.status(200).send()
})

exports.loginwithemailandPassword = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, cpassword } = req.body
    if(!name, !email, !password, !cpassword) return next(new ErrorHandler("please enter all fields"))
    if(password != cpassword)return next(new ErrorHandler("password and confirm password is incorrect"))
    const emailExist = await User.findOne({ email });
    if (emailExist) return next(new ErrorHandler("email already exist", 404));
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateOTP()
    const otp = {
        code:verificationCode
    }
    const user = await User.create({
        email,
        password: hashedPassword,
        otp,
        isVerified: false,
        expireAt: new Date(Date.now() + 1 * 60 * 1000)
    });
    await sendEmailFunService(email, verificationCode)
    return res.status(201).send({ message: "User registered, please check your email for verification code" })
})