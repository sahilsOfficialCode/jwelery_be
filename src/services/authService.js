const User = require("../model/user.model")
const nodemailer = require("nodemailer");
const { sendResetEmailFunUtils } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')

exports.updateOtpWithMobile = async (mobile, otpCode) => {
    try {
        let isExisting = await User.findOne({ mobile });
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        if (!isExisting) {
            isExisting = await User.create({
                mobile,
                provider: "whatsapp",
                otp: { code: otpCode, expiresAt },
            });
        } else {
            isExisting.otp = { code: otpCode, expiresAt };
            await isExisting.save();
        }

        return { status: true, message: "OTP sent successfully" };
    } catch (error) {
        return { status: false, message: `could not save because of ${error.message}`, }
    }
}

exports.verifyOtpWithMobile = async (type,userId, otp) => {
    try {

        const userData = type ==="mobile"? await User.findOne({ mobile:userId }):await User.findOne({ email:userId })
        if (!userData) return { status: false, message: "no user data found" }
        if (!userData.otp.code || !userData.otp.expiresAt) return { status: false, message: "No OTP generated" }

        if ((new Date()+30*60*1000) > userData.otp.expiresAt) {
            return { status: false, message: "OTP expired" }
        }

        if (userData.otp.code !== otp) {
            return { status: false, message: "invalid OTP" }
        }
        userData.isVerified = true
        userData.otp = undefined;
        userData.otpExpiresAt = undefined;
        const user = await userData.save();
        return { status: true, data: user, message: "OTP verified successfully" };
    } catch (error) {
        return { status: false, message: `OTP verification failed because of ${error.message}` }
    }
}

exports.sendEmailFunService = async (email,code) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", // or use smtp
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
     await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Email",
    html: `<h3>Your verification code is: <b>${code}</b></h3>`,
  });
}

exports.resetPasswordService = async(email)=>{
    try{
        const userData = await User.findOne({email:email}) 
        if(!userData) return {status:false,message:"could not able to find email" }
        const {_id, role,is_deleted,is_blocked,is_register } = userData
        const otp_code ={}
        otp_code.otp =  Math.floor(100000 + Math.random() * 900000).toString()
        await User.findByIdAndUpdate(_id, otp_code)
        const token = jwt.sign({id:_id,otp:otp_code.otp},process.env.JWT_SECRET,{expiresIn:"30m"})
       if(is_deleted) return {status:false,message:"This user account has been deleted. Please contact support for assistance."}
       if(is_blocked) return {status:false,message:"This user account has been blocked. Please contact support for assistance."}
       const {status,data,message } = await sendResetEmailFunUtils(email,token,"resetPassword")
        return { status, data, message }
    }catch(error){
        return { status:false,message:`something went wrong please try after sometimes...! (${error.message})`}
    }
}

exports.addNewPasswordService = async(body)=>{
    try{
        const { password, cpassword, code } = body
        if(!password) return {status:false,message:"password fields are required...!"}
        const decodeData = jwt.verify(code, process.env.JWT_SECRET);
        const { id,otp } = decodeData
        const userData = await User.findById(id)
        const { role,isVerified,is_deleted,is_blocked,is_register,otp:userOTP } = userData

         if(otp != userOTP){
            return { status:false, message:"token is entered incorrect so please try correct token"}
         }
         const hashPassword = await bcrypt.hash(password,10)
         const otp_update = { code :""}
        const result = await User.findByIdAndUpdate(id,{password:hashPassword,otp:otp_update})
         return {status:true, data:result,message:"password reset successfully"}

    }catch(error){
         if (error.name === 'TokenExpiredError') {
      return {
        status: false,
        message: 'The reset link has expired. Please request a new password reset link.'
      };
    }
        return {status:false,message:`something went wrong please try after sometimes...! (${error.message})`}
    }
}