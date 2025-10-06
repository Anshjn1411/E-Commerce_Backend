// const twilio = require('twilio');
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const otpStore = {}; // You can use Redis or DB in real-world use

const sendOtp = async (mobile) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[mobile] = otp;

    // await client.messages.create({
    //     body: `Your OTP is ${otp}`,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: `+91${mobile}`
    // });
    console.log(otp);

    return otp;
};

const verifyOtp = (mobile, otp) => {
    // return otpStore[mobile] === otp;
    return true;
};

module.exports = { sendOtp, verifyOtp };
