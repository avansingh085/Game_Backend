const express = require('express');
const router = express.Router();
const { updateProfile, getLeaderBoard } = require('../controllers/userController');

router.post('/updateProfile', updateProfile);
router.get('/getLeaderboard', getLeaderBoard);

module.exports = router;
