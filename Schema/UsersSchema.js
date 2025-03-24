const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const userSchema=new mongoose.Schema({
    name:{type:String},
    score:{type:Number,default:0},
    imageUrl:{type:String,default:""},
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
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
