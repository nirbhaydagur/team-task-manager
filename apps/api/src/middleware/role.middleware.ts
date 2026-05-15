import type { NextFunction, Request, Response } from "express";
import { ProjectRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function requireProjectMember(req: Request, _res: Response, next: NextFunction) {
  const projectId = String(req.params.projectId);
  const userId = req.user?.id;

  if (!projectId || !userId) {
    return next(new ApiError(400, "Project id is required"));
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  if (!membership) {
    return next(new ApiError(403, "You are not a member of this project"));
  }

  return next();
}

export function requireProjectRole(...roles: ProjectRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const projectId = String(req.params.projectId);
    const userId = req.user?.id;

    if (!projectId || !userId) {
      return next(new ApiError(400, "Project id is required"));
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership || !roles.includes(membership.role)) {
      return next(new ApiError(403, "You do not have permission for this action"));
    }

    return next();
  };
}
