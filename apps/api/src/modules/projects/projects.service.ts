import { ProjectRole } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { z } from "zod";
import type { addMemberSchema, createProjectSchema, updateProjectSchema } from "./projects.validators.js";

function projectInclude(userId: string) {
  return {
    members: {
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "asc" as const }
    },
    tasks: {
      select: { id: true, status: true, dueDate: true }
    },
    _count: { select: { tasks: true, members: true } },
    owner: { select: { id: true, name: true, email: true } }
  };
}

export async function listProjects(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: projectInclude(userId)
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return memberships.map((membership) => ({
    ...membership.project,
    currentUserRole: membership.role,
    overdueTasks: membership.project.tasks.filter(
      (task) => task.status !== "DONE" && task.dueDate < new Date()
    ).length
  }));
}

export async function createProject(userId: string, input: z.infer<typeof createProjectSchema>) {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: ProjectRole.ADMIN
        }
      }
    },
    include: projectInclude(userId)
  });
}

export async function getProject(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude(userId)
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return { ...project, currentUserRole: membership.role };
}

export async function updateProject(projectId: string, input: z.infer<typeof updateProjectSchema>) {
  return prisma.project.update({
    where: { id: projectId },
    data: input,
    include: projectInclude("")
  });
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({ where: { id: projectId } });
}

export async function addMember(projectId: string, input: z.infer<typeof addMemberSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiError(404, "No user exists with this email");
  }

  return prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId } },
    create: { userId: user.id, projectId, role: input.role },
    update: { role: input.role },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
}

export async function removeMember(projectId: string, userId: string, currentUserId: string) {
  if (userId === currentUserId) {
    throw new ApiError(400, "Admins cannot remove themselves from a project");
  }

  const admins = await prisma.projectMember.count({
    where: { projectId, role: ProjectRole.ADMIN }
  });
  const target = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  if (!target) {
    throw new ApiError(404, "Member not found");
  }

  if (target.role === ProjectRole.ADMIN && admins <= 1) {
    throw new ApiError(400, "A project must keep at least one admin");
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId } }
  });
}

