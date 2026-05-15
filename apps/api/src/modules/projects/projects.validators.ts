import { ProjectRole } from "@prisma/client";
import { z } from "zod";

export const projectIdParams = z.object({
  projectId: z.string().min(1)
});

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable()
});

export const updateProjectSchema = createProjectSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().email().toLowerCase(),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER)
});

export const removeMemberParams = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1)
});

