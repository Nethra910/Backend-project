import mongoose from "mongoose"
import Tasks from "../models/task.model.js"
import SubTasks from "../models/subtask.model.js"
import ProjectMember from "../models/projectMember.model.js"
import Project from "../models/project.model.js"
import { ApiErrors } from "../utils/api_error.js"
import { ApiResponce } from "../utils/api_responce.js"
import { taskStatusAvialable } from "../utils/constants.js"


const assertProjectMember = async (projectId, userId) => {
    const project = await Project.findById(projectId)
    if (!project) throw new ApiErrors(404, "Project not found")

    const member = await ProjectMember.findOne({
        project: projectId,
        user: userId
    })
    if (!member) throw new ApiErrors(403, "You are not a member of this project")

    return { project, member }
}
const getTasks = async (req, res) => {
    const { projectId } = req.params

    await assertProjectMember(projectId, req.user._id)

    const tasks = await Tasks.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        // Lookup assignedTo user
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: { $arrayElemAt: ["$assignedTo", 0] }
            }
        },
        // Lookup assignedBy user
        {
            $lookup: {
                from: "users",
                localField: "assignedBy",
                foreignField: "_id",
                as: "assignedBy",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedBy: { $arrayElemAt: ["$assignedBy", 0] }
            }
        },
        // Count subtasks
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks"
            }
        },
        {
            $addFields: {
                totalSubTasks: { $size: "$subtasks" },
                completedSubTasks: {
                    $size: {
                        $filter: {
                            input: "$subtasks",
                            as: "st",
                            cond: { $eq: ["$$st.isCompleted", true] }
                        }
                    }
                }
            }
        },
        {
            $project: {
                subtasks: 0   // remove raw subtask array from output
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponce(200, tasks, "Tasks fetched successfully"))
}
const getTaskById = async (req, res) => {
    const { projectId, taskId } = req.params

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    { $project: { _id: 1, userName: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        {
            $addFields: { assignedTo: { $arrayElemAt: ["$assignedTo", 0] } }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedBy",
                foreignField: "_id",
                as: "assignedBy",
                pipeline: [
                    { $project: { _id: 1, userName: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        {
            $addFields: { assignedBy: { $arrayElemAt: ["$assignedBy", 0] } }
        },
        // Embed full subtask list
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subTasks"
            }
        }
    ])

    if (!task.length) throw new ApiErrors(404, "Task not found")

    return res
        .status(200)
        .json(new ApiResponce(200, task[0], "Task fetched successfully"))
}
const createTask = async (req, res) => {
    const { projectId } = req.params
    const { title, description, assignedTo, status } = req.body

    if (!title) throw new ApiErrors(400, "Task title is required")

    await assertProjectMember(projectId, req.user._id)

    // If someone is being assigned, make sure they are a project member
    if (assignedTo) {
        const assignee = await ProjectMember.findOne({
            project: projectId,
            user: assignedTo
        })
        if (!assignee)
            throw new ApiErrors(400, "Assigned user is not a member of this project")
    }

    // Validate status if provided
    if (status && !taskStatusAvialable.includes(status))
        throw new ApiErrors(400, `Invalid status. Allowed values: ${taskStatusAvialable.join(", ")}`)

    const task = await Tasks.create({
        title,
        description,
        project: projectId,
        assignedTo: assignedTo || null,
        assignedBy: req.user._id,
        status: status || undefined   // let schema default kick in
    })

    return res
        .status(201)
        .json(new ApiResponce(201, task, "Task created successfully"))
}
const updateTask = async (req, res) => {
    const { projectId, taskId } = req.params
    const { title, description, assignedTo, status } = req.body

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOne({
        _id: taskId,
        project: projectId
    })

    if (!task) throw new ApiErrors(404, "Task not found")

    // Validate status if being changed
    if (status && !taskStatusAvialable.includes(status))
        throw new ApiErrors(400, `Invalid status. Allowed values: ${taskStatusAvialable.join(", ")}`)

    // Validate new assignee is a project member
    if (assignedTo) {
        const assignee = await ProjectMember.findOne({
            project: projectId,
            user: assignedTo
        })
        if (!assignee)
            throw new ApiErrors(400, "Assigned user is not a member of this project")
    }

    if (title)       task.title       = title
    if (description !== undefined) task.description = description
    if (assignedTo)  task.assignedTo  = assignedTo
    if (status)      task.status      = status

    await task.save()

    return res
        .status(200)
        .json(new ApiResponce(200, task, "Task updated successfully"))
}
const deleteTask = async (req, res) => {
    const { projectId, taskId } = req.params

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOneAndDelete({
        _id: taskId,
        project: projectId
    })

    if (!task) throw new ApiErrors(404, "Task not found")

    // Cascade delete all subtasks belonging to this task
    await SubTasks.deleteMany({ task: taskId })

    return res
        .status(200)
        .json(new ApiResponce(200, task, "Task deleted successfully"))
}
const updateTaskStatus = async (req, res) => {
    const { projectId, taskId } = req.params
    const { status } = req.body

    if (!status) throw new ApiErrors(400, "Status is required")

    if (!taskStatusAvialable.includes(status))
        throw new ApiErrors(400, `Invalid status. Allowed values: ${taskStatusAvialable.join(", ")}`)

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(taskId),
            project: new mongoose.Types.ObjectId(projectId)
        },
        { status },
        { new: true }
    )

    if (!task) throw new ApiErrors(404, "Task not found")

    return res
        .status(200)
        .json(new ApiResponce(200, task, "Task status updated successfully"))
}
const getSubTasks = async (req, res) => {
    const { projectId, taskId } = req.params

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOne({ _id: taskId, project: projectId })
    if (!task) throw new ApiErrors(404, "Task not found")

    const subTasks = await SubTasks.aggregate([
        {
            $match: {
                task: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    { $project: { _id: 1, userName: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        {
            $addFields: {
                createdBy: { $arrayElemAt: ["$createdBy", 0] }
            }
        },
        { $sort: { createdAt: 1 } }
    ])

    return res
        .status(200)
        .json(new ApiResponce(200, subTasks, "Subtasks fetched successfully"))
}
const createSubTask = async (req, res) => {
    const { projectId, taskId } = req.params
    const { title } = req.body

    if (!title) throw new ApiErrors(400, "Subtask title is required")

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOne({ _id: taskId, project: projectId })
    if (!task) throw new ApiErrors(404, "Task not found")

    const subTask = await SubTasks.create({
        title,
        task: taskId,
        createdBy: req.user._id
    })

    return res
        .status(201)
        .json(new ApiResponce(201, subTask, "Subtask created successfully"))
}
const updateSubTask = async (req, res) => {
    const { projectId, taskId, subTaskId } = req.params
    const { title, isCompleted } = req.body

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOne({ _id: taskId, project: projectId })
    if (!task) throw new ApiErrors(404, "Task not found")

    const subTask = await SubTasks.findOne({ _id: subTaskId, task: taskId })
    if (!subTask) throw new ApiErrors(404, "Subtask not found")

    if (title)                    subTask.title       = title
    if (isCompleted !== undefined) subTask.isCompleted = isCompleted

    await subTask.save()

    return res
        .status(200)
        .json(new ApiResponce(200, subTask, "Subtask updated successfully"))
}
const deleteSubTask = async (req, res) => {
    const { projectId, taskId, subTaskId } = req.params

    await assertProjectMember(projectId, req.user._id)

    const task = await Tasks.findOne({ _id: taskId, project: projectId })
    if (!task) throw new ApiErrors(404, "Task not found")

    const subTask = await SubTasks.findOneAndDelete({
        _id: subTaskId,
        task: taskId
    })

    if (!subTask) throw new ApiErrors(404, "Subtask not found")

    return res
        .status(200)
        .json(new ApiResponce(200, subTask, "Subtask deleted successfully"))
}

export {
    // Tasks
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    // SubTasks
    getSubTasks,
    createSubTask,
    updateSubTask,
    deleteSubTask
}