const userService = require("../services/user.service.js");
const jwtProvider = require("../config/jwtProvider.js");
const cartService = require("../services/cart.service.js");
const otpService = require("../services/otp.service.js");

const sendOtp = async (req, res) => {
    const { mobile } = req.body;

    try {
        await otpService.sendOtp(mobile);
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { mobile, otp } = req.body;

    try {
        const isValid = otpService.verifyOtp(mobile, otp);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const user = await userService.getUserByMobile(mobile);

        if (!user) {
            return res.status(200).json({
                newUser: true,
                message: "User not registered. Please complete registration.",
                mobile,
            });
        }

        const accessToken = jwtProvider.generateToken(user._id);
        const refreshToken = jwtProvider.generateRefreshToken(user._id);

        await userService.updateRefreshToken(user._id, refreshToken);

        return res.status(200).json({ 
            jwt:accessToken, 
            refreshToken, 
            message: "Login successful via OTP" 
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const register = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        const accessToken = jwtProvider.generateToken(user._id);

        await cartService.createCart(user);

        return res.status(200).json({ 
            jwt:accessToken, 
            message: "Registration successful" 
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const decoded = jwtProvider.verifyRefreshToken(refreshToken);
        const user = await userService.findUserById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwtProvider.generateToken(user._id);

        return res.status(200).json({
            jwt: newAccessToken,
            message: "Token refreshed successfully"
        });

    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        await userService.updateRefreshToken(userId, null);
        
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { sendOtp, verifyOtp, register, refreshAccessToken, logout };