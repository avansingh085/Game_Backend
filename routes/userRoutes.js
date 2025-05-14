const express = require('express');
const router = express.Router();
const { updateProfile, getLeaderBoard, updateScore } = require('../controllers/userController');

router.post('/updateProfile', updateProfile);
router.get('/getLeaderboard', getLeaderBoard);
router.post("/updateScore",updateScore);

module.exports = router;
