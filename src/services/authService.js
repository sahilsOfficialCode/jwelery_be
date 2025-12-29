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

exports.verifyOtpWithMobile = async (type, userId, otp) => {
    try {

        const userData = type === "mobile" ? await User.findOne({ mobile: userId }) : await User.findOne({ email: userId })
        if (!userData) return { status: false, message: "no user data found" }
        if (!userData.otp.code || !userData.otp.expiresAt) return { status: false, message: "No OTP generated" }

        if ((new Date() + 30 * 60 * 1000) > userData.otp.expiresAt) {
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

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// })

// exports.sendEmailFunService = async (email, code,name) => {
//     try {
//         await transporter.sendMail({
//         from: `"Mystiaura Store" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: "Welcome to Mystiaura Store Verify Your Email",
//         html: `
//     <div style="font-family: Arial, sans-serif; padding: 20px; background:#f7f7f7;">
//       <div style="max-width: 520px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px;">

//         <h2 style="color:#333;">Hi ${name},</h2>

//         <p style="font-size: 15px; color:#555;">
//           Welcome to <strong>Mystiaura Store</strong>! We're excited to have you with us.
//           Please use the OTP below to verify your email and complete your registration.
//         </p>

//         <div style="margin: 25px 0; text-align: center;">
//           <p style="font-size: 18px; margin-bottom: 10px; color:#333;">Your OTP Code</p>
//           <div style="display: inline-block; padding: 12px 25px; background: #4CAF50; color: white; font-size: 22px; border-radius: 8px; letter-spacing: 2px;">
//             <strong>${code}</strong>
//           </div>
//         </div>

//         <p style="font-size: 15px; color:#555;">
//           After verification, you can explore our quality products, exclusive offers, and a seamless shopping experience.
//         </p>

//         <p style="font-size: 14px; color:#888; margin-top: 25px;">
//           If you didn't sign up for Mystiaura Store, please ignore this email.
//         </p>

//       </div>
//     </div>
//   `,
//     });
//     } catch (error) {
//        console.log("<><>error",error) 
//     }

// }


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,        // can be anything
        pass: process.env.EMAIL_PASS,        // your xsmtpsib-... key
    },
});

exports.sendEmailFunService = async (email, code, name) => {
    try {
        const data = await transporter.sendMail({
            from: `"Mystiaura Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Mystiaura Verification Code",

            text: `Hi ${name}, your verification code is ${code}. Valid for 30 minutes.`,

            html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color:#660033;">Mystiaura Verification Code</h2>
            <p>Hi ${name},</p>
            <p>Your verification code is:</p>
            <div style="
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 3px;
                margin: 16px 0;
            ">
                ${code}
            </div>
            <p>This code is valid for <b>30 minutes</b>.</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <hr />
            <p style="font-size:12px;color:#777;">
                © ${new Date().getFullYear()} Mystiaura. All rights reserved.
            </p>
        </div>
    `,

            headers: {
                'List-Unsubscribe': '<mailto:unsubscribe@mystiaura.com>',
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
        });

console.log("<><>data",data);

        console.log("OTP email sent (Inbox) →", email);
    } catch (error) {
        console.error("Email failed:", error.message);
    }
};


exports.resetPasswordService = async (email) => {
    try {
        const userData = await User.findOne({ email: email })
        if (!userData) return { status: false, message: "could not able to find email" }
        const { _id, role, is_deleted, is_blocked, is_register } = userData
        const otp_code = {}
        otp_code.otp = Math.floor(100000 + Math.random() * 900000).toString()
        await User.findByIdAndUpdate(_id, otp_code)
        const token = jwt.sign({ id: _id, otp: otp_code.otp }, process.env.JWT_SECRET, { expiresIn: "30m" })
        if (is_deleted) return { status: false, message: "This user account has been deleted. Please contact support for assistance." }
        if (is_blocked) return { status: false, message: "This user account has been blocked. Please contact support for assistance." }
        const { status, data, message } = await sendResetEmailFunUtils(email, token, "resetPassword")
        return { status, data, message }
    } catch (error) {
        return { status: false, message: `something went wrong please try after sometimes...! (${error.message})` }
    }
}

exports.addNewPasswordService = async (body) => {
    try {
        const { password, cpassword, code } = body
        if (!password) return { status: false, message: "password fields are required...!" }
        const decodeData = jwt.verify(code, process.env.JWT_SECRET);
        const { id, otp } = decodeData
        
        const userData = await User.findById(id)
        const { role, isVerified, is_deleted, is_blocked, is_register, otp: userOTP } = userData
        

        if (otp != userOTP) {
            return { status: false, message: "token is entered incorrect so please try correct token" }
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const otp_update = { code: "" }
        const result = await User.findByIdAndUpdate(id, { password: hashPassword, otp: otp_update })
        return { status: true, data: result, message: "password reset successfully" }

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                status: false,
                message: 'The reset link has expired. Please request a new password reset link.'
            };
        }
        return { status: false, message: `something went wrong please try after sometimes...! (${error.message})` }
    }
}