"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Dashboard } from "@/types/api";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<{ dashboard: Dashboard }>("/dashboard")).data.dashboard
  });

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">A quick operational view of your projects and assigned work.</p>
          </div>
          <Link className="text-sm text-primary hover:underline" href="/projects">
            Manage projects
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Projects" value={data?.projectsCount ?? 0} icon={FolderKanban} />
              <StatCard label="Total tasks" value={data?.totalTasks ?? 0} icon={ListTodo} />
              <StatCard label="Overdue" value={data?.overdueTasks.length ?? 0} icon={AlertTriangle} />
              <StatCard
                label="Done"
                value={data?.tasksByStatus.find((item) => item.status === "DONE")?.count ?? 0}
                icon={CheckCircle2}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">Tasks by status</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.tasksByStatus.length ? (
                    data.tasksByStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between rounded-md bg-slate-950/40 p-3">
                        <StatusBadge status={item.status} />
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No task data yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="font-semibold">Tasks per user</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.tasksPerUser.length ? (
                    data.tasksPerUser.map((item) => (
                      <div key={item.user?.id} className="flex items-center justify-between rounded-md bg-slate-950/40 p-3">
                        <div>
                          <p className="text-sm font-medium">{item.user?.name ?? "Unassigned"}</p>
                          <p className="text-xs text-muted-foreground">{item.user?.email}</p>
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No assigned tasks yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">Overdue tasks</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.overdueTasks.length ? (
                    data.overdueTasks.map((task) => (
                      <div key={task.id} className="rounded-md border border-red-400/30 bg-red-400/10 p-3">
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-xs text-red-100">{formatDate(task.dueDate)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing overdue. Beautiful.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="font-semibold">Recent activity</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.recentTasks.length ? (
                    data.recentTasks.map((task) => (
                      <div key={task.id} className="flex gap-3 rounded-md bg-slate-950/40 p-3">
                        <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Recent updates will appear here.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

