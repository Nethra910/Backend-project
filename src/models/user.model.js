import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new Schema(
{
  avatar: {
    type: {
      url: String,
      localPath: String
    },
    default: {
      url: "",
      localPath: ""
    }
  },

  userName: {
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
    trim: true
  },

  password: {
    type: String,
    required: [true, "Password is required"]
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  refreshToken: {
    type: String
  },

  forgotPasswordToken: {
    type: String
  },

  forgotPasswordExpiry: {
    type: Date
  },

  emailVerificationToken: {
    type: String
  },

  emailVerificationExpiry: {
    type: Date
  }
},
{
  timestamps: true
}
)


// Hash password before saving
userSchema.pre("save", async function () {

  if (!this.isModified("password")) return

  this.password = await bcrypt.hash(this.password, 10)

})


// Check password
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}


// Generate Access Token
userSchema.methods.generateAccessToken = function(){

  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      email: this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )

}


// Generate Refresh Token
userSchema.methods.generateRefreshToken = function(){

  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )

}


// Generate Email Verification Token
userSchema.methods.generateTempToken = function(){

  const unHashedToken = crypto.randomBytes(20).toString("hex")

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex")

  const tokenExpiry = Date.now() + (20 * 60 * 1000)

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry
  }

}


const User = mongoose.model("User", userSchema)

export default User