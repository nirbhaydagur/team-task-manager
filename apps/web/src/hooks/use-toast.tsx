"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

type Toast = { id: string; title: string; description?: string; type?: "success" | "error" };
type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      toast: (toast: Omit<Toast, "id">) => {
        const id = crypto.randomUUID();
        setToasts((items) => [...items, { ...toast, id }]);
        window.setTimeout(() => {
          setToasts((items) => items.filter((item) => item.id !== id));
        }, 3500);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg border border-border bg-slate-950/95 p-4 shadow-soft backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={toast.type === "error" ? "font-semibold text-red-200" : "font-semibold text-teal-100"}>
                  {toast.title}
                </p>
                {toast.description ? <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p> : null}
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

