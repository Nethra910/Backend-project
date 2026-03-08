import User from "../models/user.model.js"
import { ApiResponce } from "../utils/api_responce.js"
import { ApiErrors } from "../utils/api_error.js"
import { sendEmail } from "../utils/mail.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"


const registerUser = async (req,res)=>{

    const {email,userName,password} = req.body

    if(!email || !userName || !password)
    {
        throw new ApiErrors(400,"Email, username and password are required")
    }

    const existedUser = await User.findOne({
        $or:[{email},{userName}]
    })

    if(existedUser)
    {
        throw new ApiErrors(409,"User already exists")
    }

    const newUser = await User.create({
        email,
        userName,
        password
    })

    const {unHashedToken,hashedToken,tokenExpiry} =
    newUser.generateTempToken()

    newUser.emailVerificationToken = hashedToken
    newUser.emailVerificationExpiry = tokenExpiry

    await newUser.save({validateBeforeSave:false})


    const verifyLink =
    `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`


    await sendEmail({

        email:newUser.email,

        subject:"Verify your email",

        mailgenContent:{
            body:{
                name:newUser.userName,
                intro:"Welcome to our app!",
                action:{
                    instructions:"Click below to verify your email:",
                    button:{
                        color:"#22BC66",
                        text:"Verify Email",
                        link:verifyLink
                    }
                },
                outro:"If you didn't create this account, ignore this email."
            }
        }

    })


    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    return res.status(201).json(

        new ApiResponce(
            201,
            {user:createdUser},
            "User registered successfully. Verification email sent."
        )

    )

}
const generateAccessAndRefreshToken = async (userId) => {

    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}
const login = async (req,res)=>{
    const {email,password,userName} = req.body

    if(!email){
        throw new ApiErrors(400,"email is required")
    }

    const existedUser =  await User.findOne({email})
    if(!existedUser){
        throw new ApiErrors(400,"User not found")
    }
    
    const isPasswordCorrect = await existedUser.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiErrors(400,"Password is not correct ot not valid")
    }

    const{accessToken,refreshToken} = await generateAccessAndRefreshToken(existedUser._id)
    
    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponce(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )

        )
}
const logoutUser = async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: ""}
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponce(200,{},"User logged out")
        )
}
const getCurrentUser = async(req,res)=>{
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                req.user,
                "Current user fetched successfully"
            )
        )
}
const verifyEmail = async(req,res)=>{
    const {verificationToken} = req.params
    if(!verificationToken)
        throw new ApiErrors(400,"Email verification token not found")
    
    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")
    
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })
    if(!user)
        throw new ApiErrors(400,"User not found")
    
    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpiry = null
    await user.save({validateBeforeSave: false})
    
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { isEmailVerified: true },
                "Email is verified"
            )
        )
}
const resendEmailVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user?._id)
        if (!user) throw new ApiErrors(404, "User not found")
        if (user.isEmailVerified) throw new ApiErrors(409, "Email is already verified")

        const { unHashedToken, hashedToken, tokenExpiry } = user.generateTempToken()

        user.emailVerificationToken = hashedToken
        user.emailVerificationExpiry = tokenExpiry

        await user.save({ validateBeforeSave: false })

        const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`

        await sendEmail({
            email: user.email,
            subject: "Verify your email",
            mailgenContent: {
                body: {
                    name: user.userName,
                    intro: "Welcome to our app!",
                    action: {
                        instructions: "Click below to verify your email:",
                        button: {
                            color: "#22BC66",
                            text: "Verify Email",
                            link: verifyLink
                        }
                    },
                    outro: "If you didn't create this account, ignore this email."
                }
            }
        })

        return res.status(200).json(
            new ApiResponse(200, {}, "Mail has been sent to your email id")
        )
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiErrors(401, "Unauthorized access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)
        if (!user) throw new ApiErrors(401, "User not found")

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiErrors(401, "Refresh token is expired or invalid")
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiErrors(401, "Invalid refresh token")
    }
}
const forgotPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) throw new ApiErrors(404, "User does not exist")

        const { unHashedToken, hashedToken, tokenExpiry } = user.generateTempToken()
        user.forgotPasswordToken = hashedToken
        user.forgotPasswordExpiry = tokenExpiry

        await user.save({ validateBeforeSave: false })

        const resetLink = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashedToken}`

        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            mailgenContent: {
                body: {
                    name: user.userName,
                    intro: "You requested to reset your password.",
                    action: {
                        instructions: "Click the button below to reset your password:",
                        button: {
                            color: "#22BC66",
                            text: "Reset Password",
                            link: resetLink
                        }
                    },
                    outro: "If you didn't request this, please ignore this email."
                }
            }
        })

        return res.status(200).json(
            new ApiResponce(
                200,
                {},
                "Password reset mail has been sent to your email address"
            )
        )
    } catch (error) {
        return new ApiErrors(400,error.message)
    }
}
const resetForgotPassword = async (req, res) => {

    const { newPassword } = req.body
    const { token } = req.params

    if (!newPassword) {
        throw new ApiErrors(400, "New password is required")
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiErrors(400, "Token is invalid or expired")
    }

    user.password = newPassword

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password reset successfully"
        )
    )
}
const changeCurrentPassword = async (req, res) => {

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiErrors(400, "Old password and new password are required")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiErrors(400, "Old password is invalid")
    }

    user.password = newPassword

    await user.save()

    return res.status(200).json(
        new ApiResponce(
            200,
            {},
            "Password changed successfully"
        )
    )
}

export {registerUser,login,logoutUser,
    getCurrentUser,verifyEmail,
    resendEmailVerification,refreshAccessToken,
    forgotPasswordRequest,resetForgotPassword,
    changeCurrentPassword
 }