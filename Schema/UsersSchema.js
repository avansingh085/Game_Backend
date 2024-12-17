const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    username:{type:String},
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
    chess:[{OpponnentEmail:{type:String,required:true,unique:true},winner:{type:Number,required:true}}],
    tictactoe:[{OpponnentEmail:{type:String,required:true,unique:true},winner:{type:Number,required:true}}],
    rank:{type:Number,default:100000},
    badg:{type:String,default:"newbie"},
    totalLost:{type:Number,default:0},
    totalWin:{type:Number,default:0},
    friends:[{email:{type:String,unique:true,required:true}}]
});
const createUserSchema=new mongoose.model('usersSchema',userSchema);
module.exports=createUserSchema;
