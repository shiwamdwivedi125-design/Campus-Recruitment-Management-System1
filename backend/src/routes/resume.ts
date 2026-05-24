import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { authMiddleware } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { analyzeResume } from "../services/resumeAnalyzer.js";

export const resumeRouter = Router();
resumeRouter.use(authMiddleware);

const uploadDir = path.join(process.cwd(), "uploads", "resumes");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".pdf";
      cb(null, `${req.user!.id}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("PDF only"));
      return;
    }
    cb(null, true);
  },
});

resumeRouter.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const url = `/uploads/resumes/${req.file.filename}`;
  await prisma.profile.upsert({
    where: { userId: req.user!.id },
    create: {
      id: req.user!.id,
      userId: req.user!.id,
      resumeUrl: url,
      skills: "[]",
    },
    update: { resumeUrl: url },
  });
  res.json({ resume_url: url });
});

const analyzeSchema = z.object({
  resumeText: z.string().min(50),
  targetRole: z.string().optional(),
});

resumeRouter.post("/analyze", async (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Paste at least 50 characters of your resume" });
    return;
  }
  res.json(
    analyzeResume(parsed.data.resumeText, parsed.data.targetRole)
  );
});
