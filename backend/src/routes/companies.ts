import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";
import { parseJsonArray, toCompany, toProfile } from "../lib/serialize.js";

export const companiesRouter = Router();
companiesRouter.use(authMiddleware);

companiesRouter.get("/", async (req, res) => {
  const [companies, profile, applications] = await Promise.all([
    prisma.company.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.profile.findUnique({ where: { userId: req.user!.id } }),
    prisma.application.findMany({
      where: { studentId: req.user!.id },
      select: { companyId: true },
    }),
  ]);
  res.json({
    companies: companies.map(toCompany),
    profile: profile ? toProfile(profile) : null,
    applied: applications.map((a) => a.companyId),
  });
});

companiesRouter.post("/:id/apply", async (req, res) => {
  const company = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  const existing = await prisma.application.findUnique({
    where: {
      studentId_companyId: { studentId: req.user!.id, companyId: company.id },
    },
  });
  if (existing) {
    res.status(409).json({ error: "Already applied" });
    return;
  }
  const app = await prisma.application.create({
    data: { studentId: req.user!.id, companyId: company.id },
  });
  res.status(201).json({ id: app.id, status: app.status });
});
