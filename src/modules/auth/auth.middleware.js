import { prisma } from "../../config/db.js";

import { asyncHandler } from "../../utils/asynchandler.js";

import { ApiError } from "../../utils/api-error.js";

import { ApiResponse } from "../../utils/api-response.js";

import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  // --- AUTH WALL BYPASS START ---
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        googleId: "test-google-id-123",
        picture: "https://via.placeholder.com/150",
      }
    });
  }
  req.user = user;
  return next();
  // --- AUTH WALL BYPASS END ---
});
