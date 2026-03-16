import { Router } from "express"
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} from "../controller/note.controllers.js"

import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validator.middleware.js"
import { createNoteValidator, updateNoteValidator } from "../vaildators/index.js"

const AvailableUserRole = ["admin", "member", "viewer"]

const router = Router({ mergeParams: true })

// GET    /api/v1/projects/:projectId/notes
router.get(
    "/",
    verifyJWT,
    validateProjectPermission(AvailableUserRole),
    getNotes
)

// GET    /api/v1/projects/:projectId/notes/:noteId
router.get(
    "/:noteId",
    verifyJWT,
    validateProjectPermission(AvailableUserRole),
    getNoteById
)

// POST   /api/v1/projects/:projectId/notes
router.post(
    "/",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    createNoteValidator(),
    validate,
    createNote
)

// PATCH  /api/v1/projects/:projectId/notes/:noteId
router.patch(
    "/:noteId",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    updateNoteValidator(),
    validate,
    updateNote
)

// DELETE /api/v1/projects/:projectId/notes/:noteId
router.delete(
    "/:noteId",
    verifyJWT,
    validateProjectPermission(["admin", "member"]),
    deleteNote
)

export default router