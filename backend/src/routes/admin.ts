import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, adminMiddleware } from "../lib/auth.js";
import { toApplication, toCompany, toProfile } from "../lib/serialize.js";

export const adminRouter = Router();
adminRouter.use(authMiddleware, adminMiddleware);

const STATUSES = [
  "Applied",
  "Shortlisted",
  "Aptitude",
  "GD",
  "Technical",
  "HR",
  "Selected",
  "Rejected",
];

adminRouter.get("/stats", async (_req, res) => {
  const [students, companies, applications, selected] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "Selected" } }),
  ]);
  res.json({ students, companies, applications, selected });
});

adminRouter.get("/companies", async (_req, res) => {
  const companies = await prisma.company.findMany({ orderBy: { createdAt: "desc" } });
  res.json(companies.map(toCompany));
});

const companySchema = z.object({
  name: z.string().min(1),
  role_title: z.string().optional(),
  package_lpa: z.coerce.number().optional(),
  location: z.string().optional(),
  deadline: z.string().optional().nullable(),
  min_cgpa: z.coerce.number().optional(),
  max_backlogs: z.coerce.number().optional(),
  allowed_branches: z.array(z.string()).optional(),
  required_skills: z.array(z.string()).optional(),
});

adminRouter.post("/companies", async (req, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  const company = await prisma.company.create({
    data: {
      name: d.name,
      roleTitle: d.role_title,
      packageLpa: d.package_lpa,
      location: d.location,
      deadline: d.deadline ? new Date(d.deadline) : null,
      minCgpa: d.min_cgpa,
      maxBacklogs: d.max_backlogs,
      allowedBranches: JSON.stringify(d.allowed_branches ?? []),
      requiredSkills: JSON.stringify(d.required_skills ?? []),
    },
  });
  res.status(201).json(toCompany(company));
});

adminRouter.delete("/companies/:id", async (req, res) => {
  await prisma.application.deleteMany({ where: { companyId: req.params.id } });
  await prisma.company.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

adminRouter.get("/applications", async (_req, res) => {
  const apps = await prisma.application.findMany({
    include: { company: true, student: { include: { profile: true } } },
    orderBy: { appliedAt: "desc" },
  });
  res.json(
    apps.map((a) => ({
      ...toApplication(a),
      student: {
        id: a.student.id,
        email: a.student.email,
        profile: a.student.profile ? toProfile(a.student.profile) : null,
      },
    }))
  );
});

adminRouter.patch("/applications/:id/status", async (req, res) => {
  const status = String(req.body.status || "");
  if (!STATUSES.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const app = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
    include: { company: true },
  });
  res.json(toApplication(app));
});

adminRouter.get("/students", async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { profile: true, roles: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    users
      .filter((u) => !u.roles.some((r) => r.role === "admin"))
      .map((u) => ({
        id: u.id,
        email: u.email,
        profile: u.profile ? toProfile(u.profile) : null,
      }))
  );
});
