const Users = require('../models/User.js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.js');
const sendMail = require('../utils/sendMail.js');
dotenv.config();


const verifyToken = async (req, res, next) => {
  console.log(req.headers)
  try {

    let token = req.headers.authorization || req.query?.token;

    if (!token) {
      return res.status(401).json({ success: false, result: "Token is missing" });
    }
    

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
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
    return res.status(200).send({ success: true, result: "Successfully registered"});

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

     const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);

    await user.save();

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true, 
        sameSite: 'None', 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).send({ success: true, result: "Successfully logged in", userId: user.username, Profile: user });

  } catch (err) {
    console.log(err, "error during login")
    return res.status(500).send({ success: false, result: "Internal server error" });
  }
};


const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: "No refresh token found" });
    
    const oldRefreshToken = cookies.jwt;

    res.clearCookie('jwt', { 
        httpOnly: true, 
        sameSite: 'None', 
        secure: true 
    });

    const user = await Users.findOne({ refreshTokens: oldRefreshToken });

    if (!user) {
        jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return;
            const hackedUser = await Users.findById(decoded.id);
            if (hackedUser) {
                hackedUser.refreshTokens = [];
                await hackedUser.save();
            }
        });
        return res.sendStatus(403); 
    }

   
    const newRefreshTokenArray = user.refreshTokens.filter(rt => rt !== oldRefreshToken);

    jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            
            user.refreshTokens = [...newRefreshTokenArray];
            await user.save();
            return res.status(403).json({ message: "Refresh token expired" });
        }

        const accessToken = generateAccessToken(user)

        const newRefreshToken = generateRefreshToken(user);

        user.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
        await user.save();

       
        const cookieOptions = {
            httpOnly: true,
            secure: true, 
            sameSite: 'None',
        };

        
        res.cookie('accessToken', accessToken, { 
            ...cookieOptions, 
            maxAge: 15 * 60 * 1000 
        });

       
        res.cookie('jwt', newRefreshToken, { 
            ...cookieOptions, 
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.json({ success: true, message: "Token rotated successfully" });
    });
};

const sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    await Otp.deleteMany({ email });

    await Otp.create({ email, otp });
    await sendMail(email, "Your OTP", `<h1>${otp}</h1>`);
    res.status(200).json({ message: "OTP Sent" });
};

const verifyOtp=async (req,res)=>{
    const {email,otp}=req.body;

    const savedOtp=await Otp.findOne({email});
    if(savedOtp==otp)
     return res.status(200).json({success:true,message:"otp successfully verify!"});
      return res.status(400).json({success:false,message:"failed to verify!"});
}

module.exports = { login, register ,verifyToken,handleRefreshToken,sendOtp,verifyOtp};
