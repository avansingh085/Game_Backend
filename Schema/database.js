const mongoose=require('mongoose');
const connectDB=async ()=>{
    try{
         await mongoose.connect('mongodb+srv://avansingh085:SbhUyHjWETMpJWUN@cluster0.tyyrk.mongodb.net/GameZone');
         console.log("databace connect successfully!");
    }
    catch(err)
    {
          console.log("err to connect databace ");
          process.exit(1);
    }
}
module.exports=connectDB;