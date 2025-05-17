const express = require('express');
const verifyToken=require('../middlewares/authMiddleware');
const router = express.Router();
const { updateProfile, getLeaderBoard, updateScore } = require('../controllers/userController');

router.post('/updateProfile',verifyToken, updateProfile);
router.get('/getLeaderboard', getLeaderBoard);
router.post("/updateScore",verifyToken,updateScore);

module.exports = router;
