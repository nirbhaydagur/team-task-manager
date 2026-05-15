import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./projects.service.js";

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await service.listProjects(req.user!.id);
  res.json({ projects });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await service.createProject(req.user!.id, req.body);
  res.status(201).json({ project });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await service.getProject(req.user!.id, String(req.params.projectId));
  res.json({ project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await service.updateProject(String(req.params.projectId), req.body);
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteProject(String(req.params.projectId));
  res.status(204).send();
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await service.addMember(String(req.params.projectId), req.body);
  res.status(201).json({ member });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await service.removeMember(String(req.params.projectId), String(req.params.userId), req.user!.id);
  res.status(204).send();
});
