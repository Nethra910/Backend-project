import User from "../models/user.model.js"
import Project from "../models/project.model.js"
import ProjectMember from "../models/projectMember.model.js"
import {ApiErrors} from "../utils/api_error.js"
import {ApiResponce} from "../utils/api_responce.js"
import mongoose from "mongoose"
import { userRolesEnum } from "../utils/constants.js"
const AvailableUserRole = ["admin", "member", "viewer"]

const getProjects = async (req, res) => {

  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectMembers"
            }
          },
          {
            $addFields: {
              members: {
                $size: "$projectMembers"
              }
            }
          },
          {
            $unwind: "$project"
          },
          {
            $project: {
              project: {
                name: 1,
                _id:1,
                description:1,
                members:1,
                createdAt:1,
                createdBy:1
              },
              role: 1,
              _id: 0,

            }
          }
        ]
      }
    }
  ])

  return res
        .status(200)
        .json(
          new ApiResponce(200,projects,"project fetched successfullr")
        )

}
const getProjectById = async(req,res) => {
    const{projectId} = req.params
    const project = await Project.findById(projectId)
    if(!project)
      throw new ApiErrors(404,"Project not found")
    return res
        .status(200)
        .json(
          new ApiResponce(200,project,"Project fetched successfully")
        )
}
const createProject = async (req, res) => {
  try {

    const { name, description } = req.body
    const exictedUser = await Project.findOne({name})
    if(exictedUser)
    {
        return res
            .status(400)
            .json(
                new ApiResponce(400,"project is already existed")
            )
    }

    if (!name) {
      return res.status(400).json({
        message: "Project name is required"
      })
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id
    })

    await ProjectMember.create({
      user: req.user._id,
      project: project._id,
      role: userRolesEnum.ADMIN
    })

    return res.status(201).json(
      new ApiResponce(201, project, "Project created successfully")
    )

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      message: error.message
    })

  }
}

const updateProject = async (req, res) => {

    const { name, description } = req.body
    const { projectId } = req.params

    const project = await Project.findById(projectId)

    if (!project) {
        return res
            .status(404)
            .json(
                new ApiResponce(404, null, "Project does not exist")
            )
    }

    if (name) 
      project.name = name
    if (description) 
      project.description = description

    await project.save()

    return res
        .status(200)
        .json(
            new ApiResponce(200, project, "Project updated successfully")
        )
}

const deleteProject = async (req, res) => {

  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    return res.status(404).json({
      message: "Project not found"
    });
  }

  return res.status(200).json(
    new ApiResponce(200,project, "Project deleted successfully")
  );
};
const addMembersToProject = async (req, res) => {

    const { email, role } = req.body
    const { projectId } = req.params

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    const member = await ProjectMember.findOneAndUpdate(
        {
            user: user._id,
            project: projectId
        },
        {
            user: user._id,
            project: projectId,
            role: role
        },
        {
            new: true,
            upsert: true
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponce(201, member, "member added successfully")
        )
}
const getMembersToProject = async(req,res) =>{
    const{projectId} = req.params
    const project = await Project.findById(projectId)
    if(!project)
      throw new ApiErrors(404,"project not found") 

    const projectMembers = await ProjectMember.aggregate(
      [
        {
            $match: {
              project: new mongoose.Types.ObjectId(projectId)
            },      
        },
        {
          $lookup: {
            from: "users",
            localField:"user",
            foreignField:"_id",
            as:"user",
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
            user: {
              $arrayElemAt: ["$user",0]
            }
          }
        },
        {
          $project: {
            project:1,
            user:1,
            role:1,
            createdAt:1,
            updatedAt:1,
            _id: 0
          }
        }
      ]
    )

    return res
          .status(200)
          .json(
            new ApiResponce(200,projectMembers,"project members fetched successfully")
          )
}

const updateMemberRole = async (req, res) => {
  const { projectId, userId } = req.params
  const { newRole } = req.body

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiErrors(400, "Invalid role")
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    {
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId)
    },
    { role: newRole },
    { new: true }
  )

  if (!projectMember) {
    throw new ApiErrors(404, "Project member not found")
  }

  return res.status(200).json(
    new ApiResponce(200, projectMember, "Member role updated successfully")
  )
}
const deleteMember = async(req,res) =>{
    const{projectId,userId} = req.params

    const deletedMember = await ProjectMember.findOneAndDelete(
      {
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
      }
    )
    if(!deletedMember)
        throw new ApiErrors(404,"Project member not found")
    return res
        .status(200)
        .json(
          new ApiResponce(200,deletedMember,"member hasbeen deleted successfully")
        )
}

export {
    getProjects,getProjectById,
    createProject,updateProject,
    deleteProject,addMembersToProject,
    getMembersToProject,updateMemberRole,
    deleteMember
}