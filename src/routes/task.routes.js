import { Router } from "express"
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getSubTasks,
    createSubTask,
    updateSubTask,
    deleteSubTask
} from "../controller/task.controllers.js"

import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validator.middleware.js"
import {
    createTaskValidator,
    updateTaskValidator,
    updateTaskStatusValidator,
    createSubTaskValidator,
    updateSubTaskValidator
} from "../vaildators/index.js"

const AvailableUserRole = ["admin", "member", "viewer"]
const router = Router({ mergeParams: true })


//  TASK ROUTES


// GET    /api/v1/projects/:projectId/tasks
router.get(
    "/",
    verifyJWT,
    validateProjectPermission(AvailableUserRole),
    getTasks
)

// GET    /api/v1/projects/:projectId/tasks/:taskId
router.get(
    "/:taskId",
    verifyJWT,
    validateProjectPermission(AvailableUserRole),
    getTaskById
)

// POST   /api/v1/projects/:projectId/tasks
router.post(
    "/",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    createTaskValidator(),
    validate,
    createTask
)

// PATCH  /api/v1/projects/:projectId/tasks/:taskId
router.patch(
    "/:taskId",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    updateTaskValidator(),
    validate,
    updateTask
)

// DELETE /api/v1/projects/:projectId/tasks/:taskId
router.delete(
    "/:taskId",
    verifyJWT,
    validateProjectPermission(["admin"]),
    deleteTask
)

// PATCH  /api/v1/projects/:projectId/tasks/:taskId/status
router.patch(
    "/:taskId/status",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    updateTaskStatusValidator(),
    validate,
    updateTaskStatus
)


//  SUBTASK ROUTES


// GET    /api/v1/projects/:projectId/tasks/:taskId/subtasks
router.get(
    "/:taskId/subtasks",
    verifyJWT,
    validateProjectPermission(AvailableUserRole),
    getSubTasks
)

// POST   /api/v1/projects/:projectId/tasks/:taskId/subtasks
router.post(
    "/:taskId/subtasks",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    createSubTaskValidator(),
    validate,
    createSubTask
)

// PATCH  /api/v1/projects/:projectId/tasks/:taskId/subtasks/:subTaskId
router.patch(
    "/:taskId/subtasks/:subTaskId",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    updateSubTaskValidator(),
    validate,
    updateSubTask
)

// DELETE /api/v1/projects/:projectId/tasks/:taskId/subtasks/:subTaskId
router.delete(
    "/:taskId/subtasks/:subTaskId",
    verifyJWT,
    validateProjectPermission(["admin"]),
    deleteSubTask
)

export default router