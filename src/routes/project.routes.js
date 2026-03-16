import { Router } from "express";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById,
  addMembersToProject,
  getMembersToProject,
  updateMemberRole,
  deleteMember
} from "../controller/project.controller.js";

import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, addMemberToPojectValidator } from "../vaildators/index.js";

const AvailableUserRole = ["admin", "member", "viewer"];

const router = Router();

router.post(
  "/create-project",
  verifyJWT,
  createProjectValidator(),
  validate,
  createProject
);

router.patch(
  "/update-project/:projectId",
  verifyJWT,
  validateProjectPermission(["admin", "member"]),
  validate,
  updateProject
);

router.delete(
  "/delete-project/:projectId",
  verifyJWT,
  validateProjectPermission(["admin"]),
  deleteProject
);

router.get(
  "/get-projects",
  verifyJWT,
  getProjects
);

router.get(
  "/get-projectById/:projectId",
  verifyJWT,
  validateProjectPermission(AvailableUserRole),
  getProjectById
);

router.patch(
  "/add-members-to-project/:projectId",
  verifyJWT,
  validateProjectPermission(["admin"]),
  addMemberToPojectValidator(),
  validate,
  addMembersToProject
);

router.get(
  "/get-members-to-project/:projectId",
  verifyJWT,
  validateProjectPermission(AvailableUserRole),
  getMembersToProject
);

router.patch(
  "/:projectId/update-member-role/:userId",
  verifyJWT,
  validateProjectPermission(["admin"]),
  updateMemberRole
);

router.delete(
  "/:projectId/delete-member/:userId",
  verifyJWT,
  validateProjectPermission(["admin"]),
  deleteMember
);

export default router;