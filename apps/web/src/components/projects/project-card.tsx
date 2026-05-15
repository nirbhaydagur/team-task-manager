import Link from "next/link";
import { CalendarClock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/api";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition hover:border-primary/60 hover:bg-slate-900/70">
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {project.description ?? "No description yet."}
              </p>
            </div>
            <Badge className="border-primary/30 bg-primary/10 text-primary">{project.currentUserRole}</Badge>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {project._count.members} members
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              {project._count.tasks} tasks
            </span>
            {project.overdueTasks ? <span className="text-red-200">{project.overdueTasks} overdue</span> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

