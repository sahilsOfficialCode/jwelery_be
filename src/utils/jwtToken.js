const sendToken = (token,userData, statuscode, res) => {
    const {name,email,role} = userData
    const options = {
        maxAge: Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    };
    let userDetails = {name,email,role,token}
    res.status(statuscode).cookie('token', token, options).send({ status: true, data:{users:userDetails}, message: "Login Successfully" })
}

module.exports = sendToken;