import bcrypt from "bcryptjs";
import { PrismaClient, ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const [admin, member, designer] = await Promise.all(
    [
      { name: "Nirbhay", email: "admin@example.com" },
      { name: "Maya Member", email: "member@example.com" },
      { name: "Devika Designer", email: "designer@example.com" }
    ].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: { ...user, passwordHash }
      })
    )
  );

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "Website Relaunch",
      description: "A polished demo project for the assignment walkthrough.",
      ownerId: admin.id
    }
  });

  await Promise.all([
    prisma.projectMember.upsert({
      where: { userId_projectId: { userId: admin.id, projectId: project.id } },
      update: { role: ProjectRole.ADMIN },
      create: { userId: admin.id, projectId: project.id, role: ProjectRole.ADMIN }
    }),
    prisma.projectMember.upsert({
      where: { userId_projectId: { userId: member.id, projectId: project.id } },
      update: { role: ProjectRole.MEMBER },
      create: { userId: member.id, projectId: project.id, role: ProjectRole.MEMBER }
    }),
    prisma.projectMember.upsert({
      where: { userId_projectId: { userId: designer.id, projectId: project.id } },
      update: { role: ProjectRole.MEMBER },
      create: { userId: designer.id, projectId: project.id, role: ProjectRole.MEMBER }
    })
  ]);

  await prisma.task.deleteMany({ where: { projectId: project.id } });
  await prisma.task.createMany({
    data: [
      {
        title: "Create project brief",
        description: "Summarize scope, success criteria, and owner responsibilities.",
        dueDate: new Date(Date.now() - 86400000),
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assignedToId: member.id,
        createdById: admin.id
      },
      {
        title: "Design dashboard empty states",
        description: "Add professional empty state screens for projects and tasks.",
        dueDate: new Date(Date.now() + 86400000 * 2),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        projectId: project.id,
        assignedToId: designer.id,
        createdById: admin.id
      },
      {
        title: "Prepare Railway deployment",
        description: "Verify environment variables and production build commands.",
        dueDate: new Date(Date.now() + 86400000 * 4),
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        projectId: project.id,
        assignedToId: admin.id,
        createdById: admin.id
      },
      {
        title: "Record demo walkthrough",
        description: "Prepare a 2-5 minute explanation of architecture and features.",
        dueDate: new Date(Date.now() + 86400000 * 6),
        priority: TaskPriority.LOW,
        status: TaskStatus.DONE,
        projectId: project.id,
        assignedToId: member.id,
        createdById: admin.id
      }
    ]
  });

  console.log("Seed complete");
  console.log("Admin: admin@example.com / Password123!");
  console.log("Member: member@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
