const User = require("../model/user.model")

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

exports.verifyOtpWithMobile = async (mobile,otp) => {
    try {
        const userData = await User.findOne({mobile})
        if(!userData) return {status:false,message:"no user data found"}
        if(!userData.otp.code || !userData.otp.expiresAt) return {status:false,message:"No OTP generated"}

        if(new Date() > userData.otp.expiresAt){
            return {status:false, message:"OTP expired"}
        }

        if(userData.otp.code !== otp){
            return {status:false, message:"invalid OTP"}
        }
        userData.isVerified = true
        userData.otp = undefined;
         userData.otpExpiresAt = undefined;
         const user = await userData.save();
         return { status: true,data:user, message: "OTP verified successfully" };
    } catch (error) {
 return {status:false,message:`OTP verification failed because of ${error.message}`}
    }
}