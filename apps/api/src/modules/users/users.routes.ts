import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./users.controller.js";

export const userRoutes = Router();

userRoutes.get("/", requireAuth, controller.listUsers);

