import mongoose from "mongoose"
import ProjectNote from "../models/note.model.js"
import Project from "../models/project.model.js"
import ProjectMember from "../models/projectMember.model.js"
import { ApiErrors } from "../utils/api_error.js"
import { ApiResponce } from "../utils/api_responce.js"
// import { asyncHandler } from "../utils/asyncHandler.js"

const assertProjectMember = async (projectId, userId) => {
    const project = await Project.findById(projectId)
    if (!project) throw new ApiErrors(404, "Project not found")
    const member = await ProjectMember.findOne({ project: projectId, user: userId })
    if (!member) throw new ApiErrors(403, "You are not a member of this project")
    return { project, member }
}

const getNotes = async (req, res) => {
    const { projectId } = req.params
    await assertProjectMember(projectId, req.user._id)
    const notes = await ProjectNote.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        { $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "createdBy", pipeline: [{ $project: { _id: 1, userName: 1, fullName: 1, avatar: 1 } }] } },
        { $addFields: { createdBy: { $arrayElemAt: ["$createdBy", 0] } } },
        { $sort: { createdAt: -1 } }
    ])
    return res.status(200).json(new ApiResponce(200, notes, "Notes fetched successfully"))
}

const getNoteById = async (req, res) => {
    const { projectId, noteId } = req.params
    await assertProjectMember(projectId, req.user._id)
    const note = await ProjectNote.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(noteId), project: new mongoose.Types.ObjectId(projectId) } },
        { $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "createdBy", pipeline: [{ $project: { _id: 1, userName: 1, fullName: 1, avatar: 1 } }] } },
        { $addFields: { createdBy: { $arrayElemAt: ["$createdBy", 0] } } }
    ])
    if (!note.length) throw new ApiErrors(404, "Note not found")
    return res.status(200).json(new ApiResponce(200, note[0], "Note fetched successfully"))
}

const createNote = async (req, res) => {
    const { projectId } = req.params
    const { content } = req.body
    if (!content) throw new ApiErrors(400, "Note content is required")
    await assertProjectMember(projectId, req.user._id)
    const note = await ProjectNote.create({ content, project: projectId, createdBy: req.user._id })
    return res.status(201).json(new ApiResponce(201, note, "Note created successfully"))
}

const updateNote = async (req, res) => {
    const { projectId, noteId } = req.params
    const { content } = req.body
    if (!content) throw new ApiErrors(400, "Note content is required")
    await assertProjectMember(projectId, req.user._id)
    const note = await ProjectNote.findOne({ _id: noteId, project: projectId })
    if (!note) throw new ApiErrors(404, "Note not found")
    if (note.createdBy.toString() !== req.user._id.toString())
        throw new ApiErrors(403, "You are not allowed to update this note")
    note.content = content
    await note.save()
    return res.status(200).json(new ApiResponce(200, note, "Note updated successfully"))
}

const deleteNote = async (req, res) => {
    const { projectId, noteId } = req.params
    const { member } = await assertProjectMember(projectId, req.user._id)
    const note = await ProjectNote.findOne({ _id: noteId, project: projectId })
    if (!note) throw new ApiErrors(404, "Note not found")
    const isCreator = note.createdBy.toString() === req.user._id.toString()
    const isAdmin   = member.role === "admin"
    if (!isCreator && !isAdmin)
        throw new ApiErrors(403, "You are not allowed to delete this note")
    await ProjectNote.findByIdAndDelete(noteId)
    return res.status(200).json(new ApiResponce(200, note, "Note deleted successfully"))
}

export { getNotes, getNoteById, createNote, updateNote, deleteNote }