import { ProjectRole } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireProjectMember, requireProjectRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { taskRoutesForProject } from "../tasks/tasks.routes.js";
import * as controller from "./projects.controller.js";
import {
  addMemberSchema,
  createProjectSchema,
  projectIdParams,
  removeMemberParams,
  updateProjectSchema
} from "./projects.validators.js";

export const projectRoutes = Router();

projectRoutes.use(requireAuth);
projectRoutes.get("/", controller.listProjects);
projectRoutes.post("/", validate({ body: createProjectSchema }), controller.createProject);
projectRoutes.get("/:projectId", validate({ params: projectIdParams }), controller.getProject);
projectRoutes.patch(
  "/:projectId",
  validate({ params: projectIdParams, body: updateProjectSchema }),
  requireProjectRole(ProjectRole.ADMIN),
  controller.updateProject
);
projectRoutes.delete(
  "/:projectId",
  validate({ params: projectIdParams }),
  requireProjectRole(ProjectRole.ADMIN),
  controller.deleteProject
);
projectRoutes.post(
  "/:projectId/members",
  validate({ params: projectIdParams, body: addMemberSchema }),
  requireProjectRole(ProjectRole.ADMIN),
  controller.addMember
);
projectRoutes.delete(
  "/:projectId/members/:userId",
  validate({ params: removeMemberParams }),
  requireProjectRole(ProjectRole.ADMIN),
  controller.removeMember
);
projectRoutes.use("/:projectId/tasks", validate({ params: projectIdParams }), requireProjectMember, taskRoutesForProject);

