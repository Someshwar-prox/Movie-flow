import { Router } from "express";

import {
  googleSignup,
  googleLogin,
  refreshCookies,
  logout,
  getMe,
} from "../auth/auth.controller.js";

import { verifyJwt } from "./auth.middleware.js";

import { validate } from "../../middleware/validator.js";

import { googleAuthSchema, refreshTokenSchema } from "./auth.validator.js";

const authRouter = Router();

authRouter.post("/google/signup", validate(googleAuthSchema, "body"), googleSignup);

authRouter.post("/google/login", validate(googleAuthSchema, "body"), googleLogin);

authRouter.post("/refresh", validate(refreshTokenSchema, "body"), refreshCookies);

authRouter.post("/logout", verifyJwt, logout);

authRouter.get("/me", verifyJwt, getMe);

export default authRouter;
