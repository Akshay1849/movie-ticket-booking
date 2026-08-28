import bcrypt from "bcryptjs";

import prisma from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";

const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createAuthError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const registerCustomer = async ({ email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw createAuthError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  return safeUser(user);
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user?.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    throw createAuthError("Invalid email or password", 401);
  }
  if (user.status !== "ACTIVE") {
    throw createAuthError("This account is not active", 403);
  }

  return { token: generateToken(user), user: safeUser(user) };
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw createAuthError("User not found", 401);
  }
  if (user.status !== "ACTIVE") {
    throw createAuthError("This account is not active", 403);
  }

  return safeUser(user);
};

export { getCurrentUser, login, registerCustomer };