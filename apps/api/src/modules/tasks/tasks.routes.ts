import { ProjectRole } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireProjectRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./tasks.controller.js";
import {
  createTaskSchema,
  taskFiltersSchema,
  taskIdParams,
  updateStatusSchema,
  updateTaskSchema
} from "./tasks.validators.js";

export const taskRoutesForProject = Router({ mergeParams: true });

taskRoutesForProject.get("/", validate({ query: taskFiltersSchema }), controller.listProjectTasks);
taskRoutesForProject.post(
  "/",
  validate({ body: createTaskSchema }),
  requireProjectRole(ProjectRole.ADMIN),
  controller.createTask
);

export const taskRoutes = Router();

taskRoutes.use(requireAuth);
taskRoutes.get("/:taskId", validate({ params: taskIdParams }), controller.getTask);
taskRoutes.patch("/:taskId/status", validate({ params: taskIdParams, body: updateStatusSchema }), controller.updateTaskStatus);
taskRoutes.patch("/:taskId", validate({ params: taskIdParams, body: updateTaskSchema }), controller.updateTask);
taskRoutes.delete("/:taskId", validate({ params: taskIdParams }), controller.deleteTask);

