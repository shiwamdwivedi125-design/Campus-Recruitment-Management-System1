import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminId = "00000000-0000-4000-8000-000000000001";
  const studentId = "00000000-0000-4000-8000-000000000002";

  await prisma.application.deleteMany();
  await prisma.company.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  await prisma.user.create({
    data: {
      id: adminId,
      email: "admin@campusplace.edu",
      passwordHash: adminHash,
      roles: { create: { role: "admin" } },
      profile: {
        create: {
          id: adminId,
          fullName: "Placement Officer",
          branch: "TPO",
          skills: "[]",
          readinessScore: 100,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      id: studentId,
      email: "student@campusplace.edu",
      passwordHash: studentHash,
      profile: {
        create: {
          id: studentId,
          fullName: "Rahul Sharma",
          phone: "9876543210",
          branch: "CSE",
          graduationYear: 2026,
          cgpa: 8.2,
          backlogs: 0,
          skills: JSON.stringify(["React", "Node.js", "Python", "SQL"]),
          bio: "Full-stack enthusiast",
          readinessScore: 72,
        },
      },
    },
  });

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "TechNova Solutions",
        roleTitle: "SDE Intern",
        packageLpa: 12,
        location: "Bangalore",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: JSON.stringify(["CSE", "IT", "ECE"]),
        requiredSkills: JSON.stringify(["JavaScript", "React", "DSA"]),
      },
    }),
    prisma.company.create({
      data: {
        name: "DataPulse Analytics",
        roleTitle: "Data Analyst",
        packageLpa: 8,
        location: "Hyderabad",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        minCgpa: 7,
        maxBacklogs: 1,
        allowedBranches: JSON.stringify(["CSE", "IT", "ECE", "ME"]),
        requiredSkills: JSON.stringify(["Python", "SQL", "Excel"]),
      },
    }),
    prisma.company.create({
      data: {
        name: "CloudScale Systems",
        roleTitle: "Backend Developer",
        packageLpa: 15,
        location: "Pune",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        minCgpa: 8,
        maxBacklogs: 0,
        allowedBranches: JSON.stringify(["CSE", "IT"]),
        requiredSkills: JSON.stringify(["Node.js", "PostgreSQL", "Docker"]),
      },
    }),
  ]);

  await prisma.application.create({
    data: {
      studentId,
      companyId: companies[0].id,
      status: "Shortlisted",
    },
  });

  console.log("Seed complete:");
  console.log("  Admin: admin@campusplace.edu / admin123");
  console.log("  Student: student@campusplace.edu / student123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
