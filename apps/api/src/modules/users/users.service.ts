import { prisma } from "../../config/prisma.js";

export async function searchUsers(query?: string) {
  return prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } }
          ]
        }
      : undefined,
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 20
  });
}

