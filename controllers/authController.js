const Users = require('../models/User.js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const generateToken = async (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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
    return res.status(200).send({ success: true, result: "correct token", Profile: user });
    // next(); 
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ success: false, result: "Invalid or expired token" });
  }
};

const register = async (req, res) => {

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(401).send({ success: false, result: "Invalid email or password" });
    }

    let isExistUser = await Users.findOne({ email });
    if (isExistUser) {
      return res.status(500).send({ success: false, result: "User already exists" });
    }
    
    let user = await Users.create({ name, password, email });
    await user.save();
    return res.status(200).send({ success: true, token: await generateToken(user._id), result: "Successfully registered", userId: name, Profile: user });

  } catch (err) {
    console.log(err, "error during register user");
    return res.status(400).send({ success: false, result: "Internal server error" });
  }
};

const login = async (req, res) => {

  try {
   
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ success: false, result: "Please fill all required details" });
    }

    let user = await Users.findOne({ email });
//  
    if (!user ||!(await user.matchPassword(password))) {
    
      return res.status(401).send({ success: false, result: "Invalid email or password" });
    }

    return res.status(200).send({ success: true, result: "Successfully logged in", token: await generateToken(user._id), userId: user.username, Profile: user });

  } catch (err) {
    console.log(err, "error during login")
    return res.status(500).send({ success: false, result: "Internal server error" });
  }
};

module.exports = { login, register, verifyToken };
