import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./dashboard.service.js";

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await service.getDashboard(req.user!.id);
  res.json({ dashboard });
});

export const projectDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await service.getProjectDashboard(req.user!.id, String(req.params.projectId));
  res.json({ dashboard });
});
