import mongoose,{Schema} from "mongoose"
import {userRolesEnum,userRolesAvialable} from "../utils/constants.js"

const ProjectMemberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    role: {
        type: String,
        enum: userRolesAvialable,
        default: userRolesEnum.MEMBER
    }
},{ timestamps: true})

const ProjectMember = mongoose.model("ProjectMember",ProjectMemberSchema)
export default ProjectMember