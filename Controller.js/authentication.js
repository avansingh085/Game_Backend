const login=async (req,res)=>{
   try{
         let {username,password}=req.body;
         if(!username||!password)
            return res.status(400).send({success:false,result:"please fill full required details"});
        
   }
   catch(err){

   }
}
