import multer from "multer"
import path from "path"
import { ApiErrors } from "../utils/api_error.js"

// ─────────────────────────────────────────────
//  STORAGE — saves files to /public/temp
//  with original filename + timestamp to avoid
//  name collisions
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp")
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
    }
})

// ─────────────────────────────────────────────
//  FILE FILTER — only allow images & documents
// ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new ApiErrors(400, "Unsupported file type. Allowed: jpg, png, webp, pdf, doc, docx"), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024   // 5 MB max per file
    }
})