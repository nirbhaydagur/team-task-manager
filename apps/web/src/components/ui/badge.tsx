import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", className)}
      {...props}
    />
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const classes = {
    LOW: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    MEDIUM: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    HIGH: "border-red-400/30 bg-red-400/10 text-red-200"
  }[priority];
  return <Badge className={classes}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace("_", " ");
  const classes = {
    TODO: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    IN_PROGRESS: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    DONE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
  }[status];
  return <Badge className={classes}>{label}</Badge>;
}

