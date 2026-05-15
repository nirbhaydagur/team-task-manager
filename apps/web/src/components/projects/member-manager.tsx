"use client";

import { useState } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { api, getApiError } from "@/lib/api";
import type { ProjectMember, ProjectRole } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

type MemberManagerProps = {
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
  onChanged: () => void;
};

export function MemberManager({ projectId, members, canManage, onChanged }: MemberManagerProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("MEMBER");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email, role });
      setEmail("");
      setRole("MEMBER");
      toast({ title: "Member added", type: "success" });
      onChanged();
    } catch (error) {
      toast({ title: "Could not add member", description: getApiError(error), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function removeMember(userId: string) {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast({ title: "Member removed", type: "success" });
      onChanged();
    } catch (error) {
      toast({ title: "Could not remove member", description: getApiError(error), type: "error" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Project members</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage ? (
          <form className="grid gap-3" onSubmit={addMember}>
            <div className="space-y-2">
              <Label htmlFor="member-email">User email</Label>
              <Input id="member-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Select value={role} onChange={(event) => setRole(event.target.value as ProjectRole)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <Button size="icon" disabled={loading} aria-label="Add member">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        ) : null}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="border-primary/30 bg-primary/10 text-primary">{member.role}</Badge>
                {canManage ? (
                  <Button variant="ghost" size="icon" onClick={() => removeMember(member.user.id)} aria-label="Remove member">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

