const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "python",
  "java",
  "sql",
  "mongodb",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "html",
  "css",
  "tailwind",
  "express",
  "prisma",
  "postgresql",
  "mysql",
  "redis",
  "graphql",
  "rest",
  "api",
  "machine learning",
  "data analysis",
  "excel",
  "power bi",
  "communication",
  "leadership",
  "agile",
  "scrum",
];

const ROLE_SKILLS: Record<string, string[]> = {
  frontend: ["react", "javascript", "typescript", "html", "css", "tailwind"],
  backend: ["node", "express", "sql", "postgresql", "api", "prisma"],
  data: ["python", "sql", "excel", "machine learning", "data analysis"],
  fullstack: ["react", "node", "javascript", "sql", "mongodb", "api"],
};

export type ResumeAnalysis = {
  ats_score: number;
  summary: string;
  strengths: string[];
  missing_skills: string[];
  suggestions: string[];
  detected_skills: string[];
};

export function analyzeResume(
  resumeText: string,
  targetRole?: string
): ResumeAnalysis {
  const text = resumeText.toLowerCase();
  const detected = SKILL_KEYWORDS.filter((s) => text.includes(s));
  const uniqueDetected = [...new Set(detected)];

  const roleKey = Object.keys(ROLE_SKILLS).find((k) =>
    (targetRole || "").toLowerCase().includes(k)
  );
  const expected = roleKey ? ROLE_SKILLS[roleKey] : SKILL_KEYWORDS.slice(0, 8);
  const missing = expected.filter((s) => !uniqueDetected.includes(s));

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const hasEmail = /@/.test(resumeText);
  const hasPhone = /\d{10}/.test(resumeText.replace(/\D/g, "").slice(0, 15));
  const hasExperience =
    /experience|internship|project|worked|developed|built/i.test(resumeText);

  let ats = 45;
  if (wordCount >= 150) ats += 15;
  if (wordCount >= 300) ats += 10;
  if (hasEmail) ats += 8;
  if (hasPhone) ats += 7;
  if (hasExperience) ats += 10;
  ats += Math.min(20, uniqueDetected.length * 3);
  if (missing.length === 0 && roleKey) ats += 5;
  ats = Math.min(98, Math.max(35, ats));

  const strengths: string[] = [];
  if (uniqueDetected.length >= 5)
    strengths.push(`Strong technical vocabulary (${uniqueDetected.length} skills detected)`);
  if (hasExperience) strengths.push("Includes experience or project sections");
  if (wordCount >= 200) strengths.push("Good resume length for ATS parsing");
  if (hasEmail && hasPhone) strengths.push("Contact information is present");

  const suggestions: string[] = [];
  if (!hasExperience)
    suggestions.push("Add internships, projects, or work experience with measurable outcomes");
  if (missing.length > 0)
    suggestions.push(`Highlight skills relevant to your target role: ${missing.slice(0, 4).join(", ")}`);
  if (wordCount < 150)
    suggestions.push("Expand bullet points with action verbs and quantified results");
  suggestions.push("Use standard section headings: Education, Experience, Skills, Projects");

  return {
    ats_score: ats,
    summary: `Your resume scores ${ats}/100 for ATS compatibility${
      targetRole ? ` toward a ${targetRole} role` : ""
    }. ${uniqueDetected.length} skills were detected from the text.`,
    strengths: strengths.length ? strengths : ["Clear structure and readable formatting"],
    missing_skills: missing.slice(0, 8),
    suggestions: suggestions.slice(0, 5),
    detected_skills: uniqueDetected.slice(0, 20),
  };
}
