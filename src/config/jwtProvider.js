require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECERET_KEY = process.env.SECERET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

const generateToken = (userId) => {
    const token = jwt.sign({ userId }, SECERET_KEY, { expiresIn: '7d' });
    return token;
}

const generateRefreshToken = (userId) => {
    const refreshToken = jwt.sign({ userId }, REFRESH_SECRET_KEY);
    return refreshToken;
}

const getUserIdFromToken = (token) => {
    const decodedToken = jwt.verify(token, SECERET_KEY);
    return decodedToken.userId;
}

const getUserIdFromRefreshToken = (refreshToken) => {
    const decodedToken = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    return decodedToken.userId;
}

const verifyRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
        return decoded;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    getUserIdFromToken,
    getUserIdFromRefreshToken,
    verifyRefreshToken
};