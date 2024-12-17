const Users=require('./Schema/UsersSchema.js');
const jwt=require('jsonwebtoken');
const generateToken=async (_id)=>{
  return jwt.sign({id},JWT_SECRET,{ expiresIn: '30m' });
}
const register=async (req,res)=>{
    try{
       const {username,email,password}=req.body;
       if(!username||!email||!password)
       {
          return res.status(401).send({success:false,result:"invalid email or password,user"});
       }
       let isExistUser=await Users.findOne({email});
       if(isExistUser)
       {
        return res.status(500).send({success:false,result:"user alredy exist"});
       }
       else
       {
            let user=new Users.create({username,password,email});
            await  user.save();
            return res.status(200).send({success:true,token:generateToken(user._id),result:"you are successfully register"});
       }
    }
    catch(err){
         return res.status(400).send({success:false,result:"internal server error"});
    }
}
const login=async (req,res)=>{
   try{
         let {email,password}=req.body;
         if(!email||!password)
            return res.status(400).send({success:false,result:"please fill full required details"});
        let user=await Users.findOne({email})
        if(!user&&user.matchPassowrd(password))
        {
           return res.status(200).send({success:true,result:"you are successfully Login !",token:generateToken(user._id)})
        }
        else{
            return res.status(401).send({sucess:false,result:"invalid email or password"});
        }
   }
   catch(err){
          return res.status(500).send({sucess:false,result:"internal server error"});
   }
}
module.exports={login,register};
