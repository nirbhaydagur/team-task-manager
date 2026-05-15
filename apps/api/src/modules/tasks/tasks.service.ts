import { ProjectRole, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { z } from "zod";
import type {
  createTaskSchema,
  taskFiltersSchema,
  updateStatusSchema,
  updateTaskSchema
} from "./tasks.validators.js";

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } }
};

async function getMembership(userId: string, projectId: string) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
}

async function ensureAssigneeBelongsToProject(projectId: string, assignedToId?: string | null) {
  if (!assignedToId) return;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: assignedToId, projectId } }
  });

  if (!membership) {
    throw new ApiError(400, "Assigned user must be a member of the project");
  }
}

export async function listProjectTasks(
  userId: string,
  projectId: string,
  filters: z.infer<typeof taskFiltersSchema>
) {
  const membership = await getMembership(userId, projectId);
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  return prisma.task.findMany({
    where: {
      projectId,
      ...(membership.role === ProjectRole.MEMBER ? { assignedToId: userId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {})
    },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }]
  });
}

export async function createTask(userId: string, projectId: string, input: z.infer<typeof createTaskSchema>) {
  await ensureAssigneeBelongsToProject(projectId, input.assignedToId);

  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
      assignedToId: input.assignedToId,
      createdById: userId,
      projectId
    },
    include: taskInclude
  });
}

export async function getTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await getMembership(userId, task.projectId);
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }
  if (membership.role === ProjectRole.MEMBER && task.assignedToId !== userId) {
    throw new ApiError(403, "Members can view assigned tasks only");
  }

  return task;
}

export async function updateTask(taskId: string, input: z.infer<typeof updateTaskSchema>) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");

  await ensureAssigneeBelongsToProject(task.projectId, input.assignedToId);

  return prisma.task.update({
    where: { id: taskId },
    data: input,
    include: taskInclude
  });
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({ where: { id: taskId } });
}

export async function updateTaskStatus(userId: string, taskId: string, input: z.infer<typeof updateStatusSchema>) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");

  const membership = await getMembership(userId, task.projectId);
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }
  if (membership.role === ProjectRole.MEMBER && task.assignedToId !== userId) {
    throw new ApiError(403, "Members can update assigned tasks only");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status: input.status },
    include: taskInclude
  });
}

export async function assertTaskAdmin(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) throw new ApiError(404, "Task not found");

  const membership = await getMembership(userId, task.projectId);
  if (!membership || membership.role !== ProjectRole.ADMIN) {
    throw new ApiError(403, "Only project admins can manage tasks");
  }
}

export const selectableStatuses = Object.values(TaskStatus);

