const jwt = require('jsonwebtoken');
const generateAccessToken=(user)=>{
    return jwt.sign({id:user._id},process.env.ACCESS_TOKEN_SECRETE,{expiresIn:'2m'});
}

const generateRefreshToken=(user)=>{
    return jwt.sign({id:user._id},process.env.REFRESH_TOKEN_SECRETE,{expiresIn:'7d'});
}

module.exports={generateAccessToken,generateRefreshToken}