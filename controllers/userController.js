
const User = require('../models/User');
const updateProfile = async (req, res) => {
    try {
        const { name, image, _id } = req.body;
       
        const user = await User.findOne({ _id });
        // console.log(user)
        // console.log(req.body)
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        user.name = name;
        user.imageUrl = image;
        await user.save();
        // console.log(user)
        return res.status(200).send({ success: true, user });
    }
    catch (err) {
        console.log(err, "error during update profile");
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
}
const getLeaderBoard = async (req, res) => {
    try {
        const users = await User.find().sort({ score: -1 }).limit(10);
        return res.status(200).send({ success: true, leaderboard: users });
    }
    catch (err) {
        console.log(err, "error during get leader board");
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
}
const updateScore = async (req, res) => {
    try {
       
        const { id, score } = req.body;
       
        const user = await User.findOne({ _id:id });
        if (!user)
            return res.status(400).send({ success: false, message: "invalid user id" });
        user.score += parseInt(score);
        let sc=user.score;
        user.progress.push({point:sc});
        console.log("score is update",user)
        await user.save();
        return res.status(200).send({ success: true, message: "successfully update score" ,User:user});

    

    }
    catch (err) {
        console.log(err, "error generate during score update");
        return res.status(500).send({ success: false, message: "error generate during score update", err });
    }
}

const getUserProfile=async (req,res)=>{
    const userId=req.userId;
    return await User.findById(userId);
}
module.exports = { updateProfile, getLeaderBoard, updateScore,getUserProfile };

