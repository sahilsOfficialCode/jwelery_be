const sendToken = (token, statuscode, res) => {
    const options = {
        maxAge: Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    };
    res.status(statuscode).cookie('token', token, options).send({ status: true, data: token, message: "Login Successfully" })
}

module.exports = sendToken;