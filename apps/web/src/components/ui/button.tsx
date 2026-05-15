import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-9 w-9",
        variant === "primary" && "border-primary bg-primary text-primary-foreground hover:bg-teal-300",
        variant === "secondary" && "border-border bg-muted text-foreground hover:bg-slate-700",
        variant === "ghost" && "border-transparent bg-transparent text-muted-foreground hover:text-foreground",
        variant === "danger" && "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20",
        className
      )}
      {...props}
    />
  );
}

