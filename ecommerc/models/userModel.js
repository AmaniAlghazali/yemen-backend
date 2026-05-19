import mongoose from "mongoose";
import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter your name"],
        maxLength: 20,
        minLength: 3
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Enter your email"],
        validate : [validator.isEmail, "Enter valid email"]
    },
    password: {
        type: String,
        minLength: 8,
        required: [true, "Enter your password"],
        select: false
    },
    profile: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role : {
        type : String,
        default : "user"
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date
},{
    timestamps : true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJWToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.resetPassword = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken
}

const User = mongoose.model("User", userSchema);
export default User

// 12345678 => ^salt$salt^salt£^&%(*&&**&&&(($^~^)))
// password => ^salt$salt^salt£^&%(*&&**&&&(($^~^)))
//

//(*&&(&^&*()))