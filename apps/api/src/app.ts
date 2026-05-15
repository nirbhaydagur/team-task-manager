import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { projectRoutes } from "./modules/projects/projects.routes.js";
import { taskRoutes } from "./modules/tasks/tasks.routes.js";
import { userRoutes } from "./modules/users/users.routes.js";

export const app = express();

const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:3000",
  ...(env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [])
];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        (env.NODE_ENV === "production" && origin.endsWith(".up.railway.app"));

      return callback(null, isAllowed);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "team-task-manager-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
