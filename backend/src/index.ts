import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth.js";
import { profilesRouter } from "./routes/profiles.js";
import { companiesRouter } from "./routes/companies.js";
import { applicationsRouter } from "./routes/applications.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { adminRouter } from "./routes/admin.js";
import { resumeRouter } from "./routes/resume.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "campus-place-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);
app.use("/api/resume", resumeRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(port, () => {
  console.log(`CampusPlace API running at http://localhost:${port}`);
});
