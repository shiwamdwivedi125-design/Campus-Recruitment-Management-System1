import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";
import { toApplication } from "../lib/serialize.js";

export const applicationsRouter = Router();
applicationsRouter.use(authMiddleware);

applicationsRouter.get("/me", async (req, res) => {
  const apps = await prisma.application.findMany({
    where: { studentId: req.user!.id },
    include: { company: true },
    orderBy: { appliedAt: "desc" },
  });
  res.json(apps.map((a) => toApplication(a)));
});
