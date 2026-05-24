import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";
import { toProfile } from "../lib/serialize.js";

export const dashboardRouter = Router();
dashboardRouter.use(authMiddleware);

dashboardRouter.get("/", async (req, res) => {
  const now = new Date();
  const [profile, apps, openCompanies] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: req.user!.id } }),
    prisma.application.findMany({
      where: { studentId: req.user!.id },
      include: { company: true },
    }),
    prisma.company.count({
      where: { OR: [{ deadline: null }, { deadline: { gte: now } }] },
    }),
  ]);
  res.json({
    profile: profile ? toProfile(profile) : null,
    apps: apps.map((a) => ({
      status: a.status,
      company: a.company
        ? { name: a.company.name, package_lpa: a.company.packageLpa }
        : null,
    })),
    openCompanies,
  });
});
