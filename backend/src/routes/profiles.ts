import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";
import { computeReadinessScore, parseJsonArray, toProfile } from "../lib/serialize.js";

export const profilesRouter = Router();
profilesRouter.use(authMiddleware);

profilesRouter.get("/me", async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.user!.id } });
  res.json(profile ? toProfile(profile) : null);
});

const updateSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  branch: z.string().optional(),
  graduation_year: z.coerce.number().optional().nullable(),
  cgpa: z.coerce.number().optional(),
  backlogs: z.coerce.number().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  resume_url: z.string().optional(),
});

profilesRouter.patch("/me", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  const existing = await prisma.profile.findUnique({ where: { userId: req.user!.id } });
  const skills = d.skills ?? parseJsonArray(existing?.skills);
  const readiness = computeReadinessScore({
    cgpa: d.cgpa ?? existing?.cgpa,
    skills,
    resumeUrl: d.resume_url ?? existing?.resumeUrl,
    fullName: d.full_name ?? existing?.fullName,
    branch: d.branch ?? existing?.branch,
    phone: d.phone ?? existing?.phone,
  });

  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    create: {
      id: req.user!.id,
      userId: req.user!.id,
      fullName: d.full_name,
      phone: d.phone,
      branch: d.branch,
      graduationYear: d.graduation_year ?? undefined,
      cgpa: d.cgpa,
      backlogs: d.backlogs ?? 0,
      skills: JSON.stringify(skills),
      bio: d.bio,
      resumeUrl: d.resume_url,
      readinessScore: readiness,
    },
    update: {
      fullName: d.full_name,
      phone: d.phone,
      branch: d.branch,
      graduationYear: d.graduation_year ?? undefined,
      cgpa: d.cgpa,
      backlogs: d.backlogs,
      skills: d.skills ? JSON.stringify(d.skills) : undefined,
      bio: d.bio,
      resumeUrl: d.resume_url,
      readinessScore: readiness,
    },
  });
  res.json(toProfile(profile));
});
