
const Users = require('../models/User.js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const verifyToken = async (req, res, next) => {
  console.log(req.headers)
  try {

    let token = req.headers.authorization || req.query?.token;

    if (!token) {
      return res.status(401).json({ success: false, result: "Token is missing" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req._id = decoded._id;
    let user = await Users.findOne({ _id: decoded._id });
    if (!user)
      return res.status(404).send({ success: false, result: "usernot exist thise token" });
    // return res.status(200).send({ success: true, result: "correct token", Profile: user });

    next(); 
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ success: false, result: "Invalid or expired token" });
  }
};
module.exports=verifyToken;