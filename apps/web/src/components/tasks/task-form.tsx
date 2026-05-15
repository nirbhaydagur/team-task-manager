"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { api, getApiError } from "@/lib/api";
import type { ProjectMember, TaskPriority, TaskStatus } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

type TaskFormProps = {
  projectId: string;
  members: ProjectMember[];
  onCreated: () => void;
};

export function TaskForm({ projectId, members, onCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [assignedToId, setAssignedToId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title,
        description,
        dueDate,
        priority,
        status,
        assignedToId: assignedToId || null
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("MEDIUM");
      setStatus("TODO");
      setAssignedToId("");
      toast({ title: "Task created", type: "success" });
      onCreated();
    } catch (error) {
      toast({ title: "Could not create task", description: getApiError(error), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Task title</Label>
              <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assigned user</Label>
              <Select id="assignedToId" value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

