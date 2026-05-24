import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken, authMiddleware } from "../lib/auth.js";
import { toProfile } from "../lib/serialize.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function buildUserResponse(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { profile: true, roles: true },
  });
  const isAdmin = user.roles.some((r) => r.role === "admin");
  return {
    user: {
      id: user.id,
      email: user.email,
      isAdmin,
    },
    profile: user.profile ? toProfile(user.profile) : null,
    token: signToken({ id: user.id, email: user.email, isAdmin }),
  };
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password, full_name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      passwordHash,
      profile: {
        create: {
          id: userId,
          fullName: full_name,
          skills: "[]",
        },
      },
    },
  });
  const data = await buildUserResponse(user.id);
  res.status(201).json(data);
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json(await buildUserResponse(user.id));
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    include: { profile: true, roles: true },
  });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      isAdmin: user.roles.some((r) => r.role === "admin"),
    },
    profile: user.profile ? toProfile(user.profile) : null,
  });
});
