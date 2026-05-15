import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.validators.js";

export const authRoutes = Router();

authRoutes.post("/signup", validate({ body: signupSchema }), controller.signup);
authRoutes.post("/login", validate({ body: loginSchema }), controller.login);
authRoutes.get("/me", requireAuth, controller.me);

