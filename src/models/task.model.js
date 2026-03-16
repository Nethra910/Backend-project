import mongoose,{ Schema } from "mongoose"
import { taskStatusAvialable,taskStatusEnum } from "../utils/constants.js"

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        requied: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: taskStatusAvialable,
        default: taskStatusEnum.TODO
    },
    attachments: {
        type: [{
            url: String,
            mimeType: String,
            size: Number
        }],
        default: []
    }
}, { timestamps: true})

const Tasks = mongoose.model("Tasks",taskSchema)
export default Tasks