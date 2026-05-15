import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskIdParams = z.object({
  taskId: z.string().min(1)
});

export const taskFiltersSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional()
});

export const createTaskSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z.coerce.date(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assignedToId: z.string().optional().nullable()
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus)
});

