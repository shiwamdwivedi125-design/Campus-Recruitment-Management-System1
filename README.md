# CampusPlace — Full Stack Placement Platform

End-to-end college placement app (like your [Lovable deployment](https://campus-sparkle-ai-69.lovable.app/)) with:

- **Frontend** — React + Vite + Tailwind (port 5173)
- **Backend** — Express + JWT API (port 3001)
- **Database** — SQLite via Prisma

## Quick start

```bash
# 1. Install dependencies
npm install
npm run install:all

# 2. Create database & seed demo data
npm run db:push
npm run db:seed

# 3. Run backend + frontend together
npm run dev
```

Open **http://localhost:5173**

## Demo accounts

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | admin@campusplace.edu     | admin123   |
| Student | student@campusplace.edu   | student123 |

## Architecture

```
Browser (React)
    ↓  /api/*  (Vite proxy)
Express API (JWT auth)
    ↓
SQLite (Prisma)
```

## API routes

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET/PATCH /api/profiles/me`
- `GET /api/companies` · `POST /api/companies/:id/apply`
- `GET /api/applications/me`
- `GET /api/dashboard`
- `POST /api/resume/analyze` · `POST /api/resume/upload`
- `GET/POST/DELETE /api/admin/*` (admin only)

## Production

Set `JWT_SECRET` and use PostgreSQL by changing `provider` in `backend/prisma/schema.prisma` and `DATABASE_URL`.
