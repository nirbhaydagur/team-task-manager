"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { getApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type AuthCardProps = {
  mode: "login" | "signup";
};

export function AuthCard({ mode }: AuthCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await auth.signup(name, email, password);
      } else {
        await auth.login(email, password);
      }
      toast({ title: mode === "signup" ? "Account created" : "Welcome back", type: "success" });
    } catch (error) {
      toast({ title: "Authentication failed", description: getApiError(error), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">TaskFlow</p>
          <h1 className="mt-3 text-3xl font-semibold">
            {mode === "signup" ? "Create your workspace account" : "Login to your workspace"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Interview-ready task management for focused teams.</p>
        </div>
        <Card>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === "signup" ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={mode === "signup" ? 8 : 1}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "signup" ? "Create account" : "Login"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
              <Link className="text-primary hover:underline" href={mode === "signup" ? "/login" : "/signup"}>
                {mode === "signup" ? "Login" : "Sign up"}
              </Link>
            </p>
            {mode === "login" ? (
              <div className="mt-4 rounded-md border border-border bg-slate-950/60 p-3 text-xs text-muted-foreground">
                Demo: admin@example.com / Password123!
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

