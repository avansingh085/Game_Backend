const express = require('express');
const verifyToken=require('../middlewares/authMiddleware');
const router = express.Router();
const { updateProfile, getLeaderBoard, updateScore, getUserProfile } = require('../controllers/userController');

router.post('/updateProfile',verifyToken, updateProfile);
router.get('/getLeaderboard', getLeaderBoard);
router.post("/updateScore",verifyToken,updateScore);
router.get('/profile',verifyToken,getUserProfile)

module.exports = router;
