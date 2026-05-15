export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  currentUserRole: ProjectRole;
  owner: User;
  members: ProjectMember[];
  tasks?: Pick<Task, "id" | "status" | "dueDate">[];
  _count: { tasks: number; members: number };
  overdueTasks?: number;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assignedToId?: string | null;
  assignedTo?: User | null;
  createdBy?: User;
  project?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type Dashboard = {
  projectsCount: number;
  totalTasks: number;
  tasksByStatus: { status: TaskStatus; count: number }[];
  tasksPerUser: { user?: User; count: number }[];
  overdueTasks: Task[];
  recentTasks: Task[];
};

