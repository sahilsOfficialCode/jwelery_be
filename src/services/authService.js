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
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendEmailFunService = async (email, code, name) => {
    try {
        const response = await transporter.sendMail({
            // CRITICAL: Use the exact email you verified in Brevo
            from: `"Mystiaura Store" <${process.env.EMAIL_USER}>`,

            to: email,
            subject: "Your Mystiaura Verification Code",

            // Add plain text version (required 2025)
            text: `Hi ${name},\n\nYour verification code is ${code}\n\nValid for 30 minutes.\n\nIf you didn't request this, ignore it.`,

            // Your beautiful HTML (keep it)
            html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        background: #f7f7f7;
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: #660033;
        color: #ffffff;
        padding: 22px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 30px 20px;
        color: #333333;
        text-align: center;
      }
      .content p {
        font-size: 15px;
        line-height: 1.6;
        margin: 12px 0;
      }
      .otp-box {
        margin: 25px auto;
        display: inline-block;
        padding: 14px 26px;
        font-size: 28px;
        letter-spacing: 6px;
        font-weight: bold;
        color: #660033;
        background: #f9f1f4;
        border-radius: 6px;
        border: 1px dashed #660033;
      }
      .note {
        font-size: 13px;
        color: #666;
        margin-top: 20px;
      }
      .footer {
        background: #fafafa;
        text-align: center;
        padding: 15px;
        font-size: 12px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Verify Your Email</div>

      <div class="content">
        <p>Hello <strong>${name}</strong>,</p>

        <p>
          Thank you for registering with <strong>Mystiaura</strong>.
          Please use the verification code below to complete your registration.
        </p>

        <div class="otp-box">${code}</div>

        <p class="note">
          This code is valid for <strong>30 minutes</strong>.
          Please do not share this code with anyone.
        </p>

        <p class="note">
          If you didn’t create an account with Mystiaura, you can safely ignore this email.
        </p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} Mystiaura • All rights reserved
      </div>
    </div>
  </body>
</html>
`
            ,

            // Add these headers (stops spam instantly)
            headers: {
                'List-Unsubscribe': '<mailto:unsubscribe@mystiaura.com>',
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
        });
        return response
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