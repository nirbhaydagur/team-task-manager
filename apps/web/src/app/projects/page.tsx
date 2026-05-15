"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderPlus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Project } from "@/types/api";

export default function ProjectsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get<{ projects: Project[] }>("/projects")).data.projects
  });

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="mt-2 text-muted-foreground">Create projects, invite members, and track work by team.</p>
        </div>

        <ProjectForm onCreated={() => refetch()} />

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-lg border border-border bg-muted" />
              ))}
            </div>
          ) : data?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-14 text-center">
                <FolderPlus className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">Create your first project</h2>
                <p className="mt-2 text-sm text-muted-foreground">Projects become the home for members, tasks, and analytics.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

