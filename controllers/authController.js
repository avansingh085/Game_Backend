const Users = require('../models/User.js');
const jwt = require('jsonwebtoken');

const JWT_SECRET ="189ac7bcf390094e24315f5302e07ed2d4853d27cbb3f7bdaf532f86d8025fecf3079c8fbcaa1d4166dbd783d84c1a4512e1a89810f77f7ada0a0a39e343ccfb31c066aa9d1dda3fd13f1354425745a7708cfcb6ec94109336327d0797a1e30ace0b77f82be6f1782d96ff1785e3bfe4896e24a480b02129e4ef3076bcf47d9c3bc3f0811550392eed1664ca57c47368ed48f77e9faf124ac517f51015669e9f031b5bf8fbc92a5ca12abb6133b72e0423e1538d5b31fa2209140d6594be451b6bef2da76ccb60d844cdf84a0f303f2b853de19574688a4ada6b9120556ebbd413fcbd7c26c5e7952477dc4b5348124da0c1a5cfd41ef4a8d446c771c70b820f";
const generateToken = async (_id) => {
  return jwt.sign({ _id }, JWT_SECRET, { expiresIn: '30d' });
};

const verifyToken = async (req, res, next) => {
  console.log(req.headers)
  try {
  
    let token = req.headers.authorization||req.query?.token; 
  
    if (!token) {
      return res.status(401).json({ success: false, result: "Token is missing" });
    }


    const decoded = jwt.verify(token, JWT_SECRET);
    req._id = decoded._id; 
   let user=await Users.findOne({_id:decoded._id});
   if(!user)
    return res.status(404).send({success:false,result:"usernot exist thise token"});
     return res.status(200).send({success:true,result:"correct token",Profile:user});
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
    return res.status(200).send({ success: true, token: await generateToken(user._id), result: "Successfully registered",userId:name ,Profile:isExistUser});
    
  } catch (err) {
    console.log(err,"error during register user");
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
    if (!user || !(await user.matchPassword(password))) {
     
      return res.status(401).send({ success: false, result: "Invalid email or password" });
    }
  
    return res.status(200).send({ success: true, result: "Successfully logged in", token: await generateToken(user._id),userId:user.username,Profile:user});
    
  } catch (err) {
    console.log(err,"error during login")
    return res.status(500).send({ success: false, result: "Internal server error" });
  }
};

module.exports = { login, register, verifyToken };
