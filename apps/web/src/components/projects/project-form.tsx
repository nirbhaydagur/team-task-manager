"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { api, getApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function ProjectForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/projects", { name, description });
      setName("");
      setDescription("");
      toast({ title: "Project created", type: "success" });
      onCreated();
    } catch (error) {
      toast({ title: "Could not create project", description: getApiError(error), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              className="min-h-10"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <Button disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

