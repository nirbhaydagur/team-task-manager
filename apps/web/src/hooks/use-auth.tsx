"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isBooting: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = window.localStorage.getItem("team_task_token");
    if (!storedToken) {
      setIsBooting(false);
      return;
    }

    setToken(storedToken);
    api
      .get<{ user: User }>("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => window.localStorage.removeItem("team_task_token"))
      .finally(() => setIsBooting(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBooting,
      login: async (email: string, password: string) => {
        const res = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
        window.localStorage.setItem("team_task_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        router.push("/dashboard");
      },
      signup: async (name: string, email: string, password: string) => {
        const res = await api.post<{ token: string; user: User }>("/auth/signup", { name, email, password });
        window.localStorage.setItem("team_task_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        router.push("/dashboard");
      },
      logout: () => {
        window.localStorage.removeItem("team_task_token");
        setToken(null);
        setUser(null);
        router.push("/login");
      }
    }),
    [isBooting, router, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

