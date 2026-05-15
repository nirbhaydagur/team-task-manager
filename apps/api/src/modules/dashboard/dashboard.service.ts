import { ProjectRole, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

export async function getDashboard(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true, role: true }
  });
  const projectIds = memberships.map((membership) => membership.projectId);
  const adminProjectIds = memberships
    .filter((membership) => membership.role === ProjectRole.ADMIN)
    .map((membership) => membership.projectId);

  const taskWhere = {
    OR: [{ projectId: { in: adminProjectIds } }, { assignedToId: userId }]
  };

  const [projectsCount, totalTasks, statusGroups, overdueTasks, tasksPerUser, recentTasks] =
    await Promise.all([
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.groupBy({
        by: ["status"],
        where: taskWhere,
        _count: { status: true }
      }),
      prisma.task.findMany({
        where: {
          ...taskWhere,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: new Date() }
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { dueDate: "asc" },
        take: 8
      }),
      prisma.task.groupBy({
        by: ["assignedToId"],
        where: { projectId: { in: projectIds }, assignedToId: { not: null } },
        _count: { assignedToId: true }
      }),
      prisma.task.findMany({
        where: taskWhere,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: "desc" },
        take: 8
      })
    ]);

  const users = await prisma.user.findMany({
    where: { id: { in: tasksPerUser.map((item) => item.assignedToId).filter(Boolean) as string[] } },
    select: { id: true, name: true, email: true }
  });

  return {
    projectsCount,
    totalTasks,
    tasksByStatus: statusGroups.map((item) => ({ status: item.status, count: item._count.status })),
    tasksPerUser: tasksPerUser.map((item) => ({
      user: users.find((user) => user.id === item.assignedToId),
      count: item._count.assignedToId
    })),
    overdueTasks,
    recentTasks
  };
}

export async function getProjectDashboard(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const where =
    membership.role === ProjectRole.ADMIN ? { projectId } : { projectId, assignedToId: userId };

  const [totalTasks, statusGroups, overdueCount, priorityGroups] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.groupBy({ by: ["status"], where, _count: { status: true } }),
    prisma.task.count({
      where: { ...where, status: { not: TaskStatus.DONE }, dueDate: { lt: new Date() } }
    }),
    prisma.task.groupBy({ by: ["priority"], where, _count: { priority: true } })
  ]);

  return {
    totalTasks,
    overdueCount,
    tasksByStatus: statusGroups.map((item) => ({ status: item.status, count: item._count.status })),
    tasksByPriority: priorityGroups.map((item) => ({
      priority: item.priority,
      count: item._count.priority
    }))
  };
}

