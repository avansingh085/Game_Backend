const express = require('express');
const router = express.Router();
const { login, register, verifyToken, handleRefreshToken, sendOtp, verifyOtp, changePassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/verifyToken', verifyToken);
router.post('/refresh-token',handleRefreshToken);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
router.post('/reset-password',changePassword);

module.exports = router;
