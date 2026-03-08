import User from "../models/user.model.js"
import { ApiErrors } from "../utils/api_error.js"
import jwt from "jsonwebtoken"
const verifyJWT = async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token)
        throw new ApiErrors(401,"UnAuthorized request Nethra")

    try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        )
        if(!user)
            throw new ApiErrors(401,"Access Token is invalid")
        req.user = user
        next()
    } catch (error) {
        throw new ApiErrors(401,"Invalid access token") 
    }
}   

export { verifyJWT }