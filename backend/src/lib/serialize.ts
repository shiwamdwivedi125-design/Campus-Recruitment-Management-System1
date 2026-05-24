import type { Profile, Company, Application, User } from "@prisma/client";

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toProfile(p: Profile) {
  return {
    id: p.id,
    full_name: p.fullName,
    phone: p.phone,
    branch: p.branch,
    graduation_year: p.graduationYear,
    cgpa: p.cgpa,
    backlogs: p.backlogs,
    skills: parseJsonArray(p.skills),
    bio: p.bio,
    resume_url: p.resumeUrl,
    readiness_score: p.readinessScore,
  };
}

export function toCompany(c: Company) {
  return {
    id: c.id,
    name: c.name,
    role_title: c.roleTitle,
    package_lpa: c.packageLpa,
    location: c.location,
    deadline: c.deadline?.toISOString() ?? null,
    min_cgpa: c.minCgpa,
    max_backlogs: c.maxBacklogs,
    allowed_branches: parseJsonArray(c.allowedBranches),
    required_skills: parseJsonArray(c.requiredSkills),
    created_at: c.createdAt.toISOString(),
  };
}

export function toApplication(a: Application & { company?: Company }) {
  return {
    id: a.id,
    student_id: a.studentId,
    company_id: a.companyId,
    status: a.status,
    applied_at: a.appliedAt.toISOString(),
    company: a.company ? toCompany(a.company) : undefined,
  };
}

export function computeReadinessScore(profile: {
  cgpa?: number | null;
  skills?: string[];
  resumeUrl?: string | null;
  fullName?: string | null;
  branch?: string | null;
  phone?: string | null;
}) {
  const cgpaScore = Math.min(100, ((profile.cgpa || 0) / 10) * 100);
  const skillsScore = Math.min(100, (profile.skills?.length || 0) * 12);
  const resumeScore = profile.resumeUrl ? 100 : 0;
  const profileScore =
    profile.fullName && profile.branch && profile.phone ? 100 : 50;
  return Math.round(
    cgpaScore * 0.4 + skillsScore * 0.3 + resumeScore * 0.2 + profileScore * 0.1
  );
}

