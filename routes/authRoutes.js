const express = require('express');
const router = express.Router();
const { login, register, verifyToken } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/verifyToken', verifyToken);

module.exports = router;
