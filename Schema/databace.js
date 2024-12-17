const mongoose=require('mongoose');
const connectDB=async ()=>{
    try{
         await mongoose.connect('mongodb://127.0.0.1:27017/GameZone');
         console.log("databace connect successfully!");
    }
    catch(err)
    {
          console.log("err to connect databace ");
          process.exit(1);
    }
}
module.exports=connectDB;