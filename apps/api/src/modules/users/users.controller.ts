import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as usersService from "./users.service.js";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await usersService.searchUsers(String(req.query.q ?? ""));
  res.json({ users });
});

