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

// exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
//     const { mobile, email, otp } = req.body
//     let otpVerify
//     if (mobile) {
//         otpVerify = await verifyOtpWithMobile("mobile", mobile, otp)
//     }
//     if (email) {
//         otpVerify = await verifyOtpWithMobile("email", email, otp)
//     }

//     if (!otpVerify.status) {
//         return next(new ErrorHandler(otpVerify.message, 500));
//     }
//     if (!otpVerify) {
//         return next(new ErrorHandler(otpVerify.message, 500));
//     }
//     const token = jwt.sign({ _id: otpVerify.data._id, mobile: otpVerify.data.mobile, role: otpVerify.data.role, provider: otpVerify.data.provider }, process.env.JWT_SECRET, { expiresIn: '30d' });
//     sendToken(token, 200, res);
//     return res.status(200).send()
// })

exports.registerwithemailandPassword = catchAsyncErrors(async (req, res, next) => {
    const { email, name } = req.body
    if (!email) return next(new ErrorHandler("please enter all fields"))
    const emailExist = await User.findOne({ email, is_register: true });
    if (emailExist) return next(new ErrorHandler("email already exist", 400));

     const emailData = await User.findOne({ email, is_register: false });
    const verificationCode = generateOTP()
    const otp = {
        code: verificationCode
    }
     await sendEmailFunService(email, verificationCode)
    if(emailData){
        await User.findByIdAndUpdate(emailData._id,otp)
         return res.status(201).send({ success: true, data: { email: email }, message: "A verification code has been sent to your email. Please enter it to continue signing in" })
    }
    await User.create({ name, email: email.toLowerCase(),otp })
    return res.status(201).send({ success: true, data: { email: email }, message: "A verification code has been sent to your email. Please enter it to continue signing in" })
})

exports.registerWithEmailandPasswordVerify = catchAsyncErrors(async (req, res, next) => {
    const { name, email, otp, password, cpassword } = req.body
    if (!email || !otp || !password) return res.status(400).send({ success: false, message: "Please fill in all required fields" })
    const emailData = await User.findOne({ email: email.toLowerCase(), is_register: false });
    if (!emailData) return res.status(400).send({ success: false, message: "please check the email something went wrong please contact admin" })
    if (emailData.otp.code != otp) return res.status(400).send({ success: false, message: "The OTP you entered does not match" })
    const hashPassword = await bcrypt.hash(password, 10)
    const updateData = await User.findByIdAndUpdate(emailData._id, { is_register: true, otp: undefined, password: hashPassword })
    return res.status(200).send({ success: true, message: "User data and OTP verified successfully. You can now continue to login." })
})

exports.loginWithEmailAndPassword = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body
    const emailData = await User.findOne({ email }).select('+password')
    if (!emailData) return next(new ErrorHandler("No account found with this email. Please sign up first",400))

    if (!emailData.is_register) return next(new ErrorHandler("Your account is not registered. Please complete the registration process",403))

  if (emailData.is_deleted) return next(new ErrorHandler("This account has been deleted. Please contact support if this is a mistake",400))

  if (emailData.is_blocked) return next(new ErrorHandler("Your account has been blocked. Please reach out to support for assistance",400))
  const passwordMatch = await bcrypt.compare(password,emailData.password)
  
  if(!passwordMatch) return next(new ErrorHandler("Invalid email or password. Please try again",403))
    const token = jwt.sign({id:emailData._id,email:email.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES})
    sendToken(token,emailData,200,res);

})

exports.loginWithEmail