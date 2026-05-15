"use client";

import { AlertTriangle, CalendarDays, CheckCircle2 } from "lucide-react";
import { Badge, PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { api, getApiError } from "@/lib/api";
import { formatDate, isOverdue } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

type TaskListProps = {
  tasks: Task[];
  canManage?: boolean;
  onChanged?: () => void;
};

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TaskList({ tasks, canManage = false, onChanged }: TaskListProps) {
  const { toast } = useToast();

  async function updateStatus(taskId: string, status: TaskStatus) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      toast({ title: "Task status updated", type: "success" });
      onChanged?.();
    } catch (error) {
      toast({ title: "Could not update task", description: getApiError(error), type: "error" });
    }
  }

  async function deleteTask(taskId: string) {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast({ title: "Task deleted", type: "success" });
      onChanged?.();
    } catch (error) {
      toast({ title: "Could not delete task", description: getApiError(error), type: "error" });
    }
  }

  if (!tasks.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">No tasks match this view</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create a task or adjust the current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = isOverdue(task.dueDate, task.status);
        return (
          <Card key={task.id} className={overdue ? "border-red-400/50" : undefined}>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {overdue ? (
                    <Badge className="border-red-400/40 bg-red-400/10 text-red-200">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Overdue
                    </Badge>
                  ) : null}
                </div>
                {task.description ? <p className="mt-2 text-sm text-muted-foreground">{task.description}</p> : null}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(task.dueDate)}
                  </span>
                  <span>Assigned to {task.assignedTo?.name ?? "Unassigned"}</span>
                  {task.project ? <span>{task.project.name}</span> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  aria-label="Update task status"
                  value={task.status}
                  onChange={(event) => updateStatus(task.id, event.target.value as TaskStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </Select>
                {canManage ? (
                  <Button variant="danger" onClick={() => deleteTask(task.id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

