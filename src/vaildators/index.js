import { body } from "express-validator"

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body("userName")
            .trim()
            .notEmpty().withMessage("UserName is required")
            .isLowercase().withMessage("UserName should be in lowercase")
            .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail().withMessage("Email is invalid"),
        body("password")
            .notEmpty().withMessage("Password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password is required")
    ]
}

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("Password is required")
    ]
}
//  PROJECT VALIDATORS
// ─────────────────────────────────────────────
const createProjectValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("description").optional()
    ]
}

const addMemberToPojectValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body("role").notEmpty().withMessage("Role is required")
    ]
}
const createTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty().withMessage("Task title is required"),
        body("description")
            .optional(),
        body("assignedTo")
            .optional()
            .isMongoId().withMessage("assignedTo must be a valid user ID"),
        body("status")
            .optional()
            .isIn(["todo", "in_process", "done"])
            .withMessage("Status must be one of: todo, in_process, done")
    ]
}

const updateTaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim()
            .notEmpty().withMessage("Title cannot be empty"),
        body("description")
            .optional(),
        body("assignedTo")
            .optional()
            .isMongoId().withMessage("assignedTo must be a valid user ID"),
        body("status")
            .optional()
            .isIn(["todo", "in_process", "done"])
            .withMessage("Status must be one of: todo, in_process, done")
    ]
}

const updateTaskStatusValidator = () => {
    return [
        body("status")
            .notEmpty().withMessage("Status is required")
            .isIn(["todo", "in_process", "done"])
            .withMessage("Status must be one of: todo, in_process, done")
    ]
}
const createSubTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty().withMessage("Subtask title is required")
    ]
}

const updateSubTaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim()
            .notEmpty().withMessage("Title cannot be empty"),
        body("isCompleted")
            .optional()
            .isBoolean().withMessage("isCompleted must be a boolean value")
    ]
}
const createNoteValidator = () => {
    return [
        body("content")
            .trim()
            .notEmpty().withMessage("Note content is required")
    ]
}

const updateNoteValidator = () => {
    return [
        body("content")
            .trim()
            .notEmpty().withMessage("Note content is required")
    ]
}

export {
    // Auth
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    // Project
    createProjectValidator,
    addMemberToPojectValidator,
    // Task
    createTaskValidator,
    updateTaskValidator,
    updateTaskStatusValidator,
    // Subtask
    createSubTaskValidator,
    updateSubTaskValidator,
    // Note
    createNoteValidator,
    updateNoteValidator
}