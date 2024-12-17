const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
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

userSchema.methods.matchPassword=async function (enteredPassword){
    return bcrypt.compare(enteredPassword,this.password);
}
userSchema.pre('save',async function (next){
    if(!(this.isModified('password')))
        return next();
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})
const createUserSchema=new mongoose.model('usersSchema',userSchema);
module.exports=createUserSchema;
