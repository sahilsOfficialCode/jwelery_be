const nodemailer = require("nodemailer");

exports.sendResetEmailFunUtils = async (email, token, type) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (type === "resetPassword") {
    const resetLink = `https://ecommerce-fe-pink.vercel.app/login/${token}`;

    const data = await transporter.sendMail({
      from: `"MyApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your MyApp Password",
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset</title>
          <style>
            body { background:#f7f7f7; margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: #2874f0;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              font-size: 22px;
              font-weight: bold;
            }
            .content {
              padding: 30px 20px;
              color: #333333;
              text-align: center;
            }
            .btn {
              display: inline-block;
              margin: 20px 0;
              padding: 12px 24px;
              background: #2874f0;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
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
            <div class="header">MyApp Password Reset</div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <a href="${resetLink}" class="btn">Reset Password</a>
              <p>This link will expire in 10 minutes. If you did not request a password reset, you can ignore this email.</p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} MyApp • All rights reserved
            </div>
          </div>
        </body>
      </html>
      `
    });

    return {
      status: true,
      data,
      message: "Password reset link has been successfully sent to your provided email address."
    };
  }
};
