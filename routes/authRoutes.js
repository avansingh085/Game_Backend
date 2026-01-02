const express = require('express');
const router = express.Router();
const { login, register, handleRefreshToken, sendOtp, verifyOtp, changePassword, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token',handleRefreshToken);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
router.post('/reset-password',changePassword);
router.get('/logout',logout);

module.exports = router;
