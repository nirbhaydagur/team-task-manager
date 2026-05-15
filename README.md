# Team Task Manager

A production-style Team Task Manager assignment built with Next.js App Router, TypeScript, Express, PostgreSQL, Prisma, JWT authentication, bcrypt-compatible password hashing, Tailwind CSS, and shadcn-style UI primitives.

## Features

- Signup and login with JWT authentication
- Password hashing with bcryptjs
- Project-level roles: `ADMIN` and `MEMBER`
- Admin project management and member management
- Admin task creation, assignment, editing-ready API, and deletion
- Member access to assigned tasks only
- Member task status updates
- Dashboard analytics for total tasks, status counts, tasks per user, overdue tasks, and recent activity
- Responsive dark dashboard UI
- Loading states, empty states, validation, and toast notifications
- Railway-ready environment configuration

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn-style components
- API: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT and bcryptjs
- Client data: Axios and TanStack Query
- Deployment: Railway

## Local Setup

Install dependencies from the repository root:

```bash
npm install
```

Create local env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Run Prisma migration and seed data:

```bash
npm run prisma:migrate
npm run db:seed
```

Start both apps:

```bash
npm run dev
```

On this Windows machine, if `npm` is not available in PATH, run:

```powershell
.\scripts\start-local.ps1
```

Open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health

Demo credentials:

```txt
Admin: admin@example.com / Password123!
Member: member@example.com / Password123!
```

## Folder Structure

```txt
apps/
  api/
    prisma/
    src/
      config/
      middleware/
      modules/
        auth/
        dashboard/
        projects/
        tasks/
        users/
      utils/
  web/
    src/
      app/
      components/
      hooks/
      lib/
      types/
packages/
  shared/
```

## API Testing Guide

Use the seeded admin account to get a token:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'
```

Use the returned token:

```bash
curl http://localhost:4000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Create a project:

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mobile App","description":"Build the first release plan"}'
```

Create a task:

```bash
curl -X POST http://localhost:4000/api/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Create wireframes","description":"Dashboard and task board","dueDate":"2026-05-22","priority":"HIGH","assignedToId":"USER_ID"}'
```

Update task status:

```bash
curl -X PATCH http://localhost:4000/api/tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'
```

## Railway Deployment

Create three Railway services:

1. PostgreSQL database
2. Backend service from this GitHub repo with root directory `apps/api`
3. Frontend service from this GitHub repo with root directory `apps/web`

Backend environment variables:

```txt
DATABASE_URL=Railway PostgreSQL connection string
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-frontend.railway.app
JWT_SECRET=long-random-production-secret
JWT_EXPIRES_IN=7d
```

Backend commands:

```txt
Build: npm install && npx prisma generate && npm run build
Start: npx prisma migrate deploy && npm run start
```

Frontend environment variables:

```txt
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

Frontend commands:

```txt
Build: npm install && npm run build
Start: npm run start
```

## Interview Explanation

- Roles are project-scoped through `ProjectMember`, so one user can be an admin in one project and a member in another.
- The API is modular: routes, controllers, services, validators, middleware, and config are separated.
- JWT protects private API routes, and bcryptjs hashes passwords before storage.
- Zod validates request payloads before they reach service logic.
- Prisma models enforce relationships between users, projects, memberships, and tasks.
- Admins manage projects, members, and tasks; members can view and update assigned tasks only.
- The dashboard uses API aggregation to surface assignment-ready metrics.
