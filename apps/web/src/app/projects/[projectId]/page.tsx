"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Filter } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { MemberManager } from "@/components/projects/member-manager";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { api } from "@/lib/api";
import type { Project, Task, TaskPriority, TaskStatus } from "@/types/api";

type PageProps = {
  params: {
    projectId: string;
  };
};

export default function ProjectDetailPage({ params }: PageProps) {
  const [status, setStatus] = useState<"" | TaskStatus>("");
  const [priority, setPriority] = useState<"" | TaskPriority>("");

  const projectQuery = useQuery({
    queryKey: ["project", params.projectId],
    queryFn: async () => (await api.get<{ project: Project }>(`/projects/${params.projectId}`)).data.project
  });

  const tasksQuery = useQuery({
    queryKey: ["project-tasks", params.projectId, status, priority],
    queryFn: async () =>
      (
        await api.get<{ tasks: Task[] }>(`/projects/${params.projectId}/tasks`, {
          params: {
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {})
          }
        })
      ).data.tasks
  });

  const project = projectQuery.data;
  const canManage = project?.currentUserRole === "ADMIN";
  const grouped = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    return {
      todo: tasks.filter((task) => task.status === "TODO").length,
      progress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      done: tasks.filter((task) => task.status === "DONE").length
    };
  }, [tasksQuery.data]);

  function refreshAll() {
    projectQuery.refetch();
    tasksQuery.refetch();
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <Link className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/projects">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        {projectQuery.isLoading ? (
          <div className="h-52 animate-pulse rounded-lg border border-border bg-muted" />
        ) : project ? (
          <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold">{project.name}</h1>
                  <Badge className="border-primary/30 bg-primary/10 text-primary">{project.currentUserRole}</Badge>
                </div>
                <p className="mt-2 max-w-2xl text-muted-foreground">{project.description ?? "No description yet."}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">{grouped.todo}</p>
                    <p className="text-xs text-muted-foreground">To Do</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">{grouped.progress}</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">{grouped.done}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
              <div className="space-y-6">
                {canManage ? <TaskForm projectId={project.id} members={project.members} onCreated={refreshAll} /> : null}
                <Card>
                  <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Filter className="h-4 w-4 text-primary" />
                      Filters
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Select value={status} onChange={(event) => setStatus(event.target.value as "" | TaskStatus)}>
                        <option value="">All statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </Select>
                      <Select value={priority} onChange={(event) => setPriority(event.target.value as "" | TaskPriority)}>
                        <option value="">All priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {tasksQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
                    ))}
                  </div>
                ) : (
                  <TaskList tasks={tasksQuery.data ?? []} canManage={canManage} onChanged={refreshAll} />
                )}
              </div>

              <MemberManager projectId={project.id} members={project.members} canManage={Boolean(canManage)} onChanged={refreshAll} />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Project not found.</CardContent>
          </Card>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

