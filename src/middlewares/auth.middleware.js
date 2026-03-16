import User from "../models/user.model.js"
import { ApiErrors } from "../utils/api_error.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import ProjectMember from "../models/projectMember.model.js"
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

const validateProjectPermission = (roles = []) => {
  return async (req, res, next) => {
    const { projectId } = req.params

    if (!projectId)
      throw new ApiErrors(400, "project id is missing")

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id)
    })

    if (!project)
      throw new ApiErrors(403, "User is not part of this project")

    const givenRole = project.role
    req.user.role = givenRole

    if (!roles.includes(givenRole))
      throw new ApiErrors(403, "You do not have permission to perform the action")

    next()
  }
}
export { verifyJWT,validateProjectPermission }