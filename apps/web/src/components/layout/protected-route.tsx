"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isBooting } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isBooting && !user) router.push("/login");
  }, [isBooting, router, user]);

  if (isBooting || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading workspace
      </div>
    );
  }

  return <>{children}</>;
}

