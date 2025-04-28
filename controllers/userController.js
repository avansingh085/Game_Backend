
const User=require('../models/User');
const updateProfile=async (req,res)=>{
    try{
        const {name,imageUrl,_id}=req.body;
        const user=await User.findOne({_id});
        if(!user){
            return res.status(404).json({msg:"User not found"});
        }
        user.name=name;
        user.imageUrl=imageUrl;
        await user.save();
      return res.status(200).send({success:true,user});
    }
    catch(err){
        console.log(err,"error during update profile");
       return res.status(500).send({success:false,msg:"Internal Server Error"});
    }
}
const getLeaderBoard=async (req,res)=>{
    try{
        const users=await User.find().sort({score:-1}).limit(10);
        return res.status(200).send({success:true,leaderboard:users});
    }
    catch(err){
        console.log(err,"error during get leader board");
        return res.status(500).send({success:false,msg:"Internal Server Error"});
    }
}
module.exports={updateProfile,getLeaderBoard};

        