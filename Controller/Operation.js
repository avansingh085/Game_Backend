
const User=require('../Schema/UsersSchema');
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
        console.log(err);
       return res.status(500).send({success:false,msg:"Internal Server Error"});
    }
}

module.exports={updateProfile};

        