const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const getCurrentFormattedDate = () => {
    const now = new Date();
    const yy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yy}/${mm}/${dd}`;
};


const userSchema = new mongoose.Schema({
    name: { type: String },
    score: { type: Number, default: 0 },
    imageUrl: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzCW8ayM9K_iNzX81NSjgpGcl30jDvsTSiIg&s"
    },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    progress: [
        {
            date: { type: String, default: getCurrentFormattedDate },
            point: { type: Number, required: true }
        }
    ]
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
