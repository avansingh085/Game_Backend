const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
const connectDB=async ()=>{
    try{
         await mongoose.connect(process.env.MONGODB_URL);
         console.log("databace connect successfully!");
    }
    catch(err)
    {
          console.log("err to connect databace ");
          process.exit(1);
    }
}
module.exports=connectDB;