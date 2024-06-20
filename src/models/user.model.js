import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
      },

       avatar: {
        type: String,  //cloudinary url we use here (yeh aws ki tarah hi ek service hai jaha videos , images,
         // ya files jo bhi chahiye aap upload karke ek url de deta hai)
        required: true,
      },

      coverImage: {
        type: String,
      },

      watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
      ],

      password: {
        type: String,
        required: [true , "Password is required"]
      },

      refreshToken: {
        type: String
      }
    },

    {timestamps: true}

)

//jab bhi data save ho usse pehle mujhe apna password encrypt karvana hai 
//middleware ka flag hai toh next ka access toh hona hi chaiye

//password field ka modification jab mai bheju tabhi iss code ko humko run karna hai 
//agar uss field mai password mai koi modification nhi hai toh usko run mat karo no means
//basically jab password field bheje tab hi encrypt karana hai nhi toh nhi , so we write if condition
userSchema.pre("save" ,async function (next) {
    //agar password modify nhi hua hai to simply next return kardo
    if(!this.isModified("password"))   return next();

    //jab bhi mera yeh password ya pura filed save ho raha hai , us mai se ek password field ko lo aur 
    //encrypt karke save kardo 
    this.password = await bcrypt.hash(this.password , 10)
    next()
})
//this whole will run when save is called so to avoid this


//custom methods we write here 
userSchema.methods.isPasswordCorrect = async function(password){
    
    //bcrypt humara check karega ki password humara sahi h ki nhi
    //isme this.password humara encrypted vala hai
   return await bcrypt.compare(password,this.password)
   //finally it will return true or false

}

//method to generate access token
userSchema.methods.generateAccessToken = function(){
  //returns the access token of jwt
  //iss process mai time ni lagta that's why we not use async await here 
  return jwt.sign(
    {
    //this._id -> db se id dega
      _id: this._id,
    //email-> humare payload ka naam hai , this.email -> humare db se aa rahi hai 
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

//method to generate refresh token
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
    //this._id -> db se id dega
      _id: this._id,
    //email-> humare payload ka naam hai , this.email -> humare db se aa rahi hai 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

//yeh user mongoDB se directly connected hai
export const User = mongoose.model("User",userSchema)