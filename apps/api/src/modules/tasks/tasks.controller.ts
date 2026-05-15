import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./tasks.service.js";

export const listProjectTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await service.listProjectTasks(req.user!.id, String(req.params.projectId), req.query);
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await service.createTask(req.user!.id, String(req.params.projectId), req.body);
  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await service.getTask(req.user!.id, String(req.params.taskId));
  res.json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  await service.assertTaskAdmin(req.user!.id, String(req.params.taskId));
  const task = await service.updateTask(String(req.params.taskId), req.body);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await service.assertTaskAdmin(req.user!.id, String(req.params.taskId));
  await service.deleteTask(String(req.params.taskId));
  res.status(204).send();
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await service.updateTaskStatus(req.user!.id, String(req.params.taskId), req.body);
  res.json({ task });
});
