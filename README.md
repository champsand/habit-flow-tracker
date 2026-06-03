# Habit Flow

Habit Flow is a full-stack weekly habit tracking web app. It supports good habits, bad habit avoidance, activity logs, daily check-ins, weekly summaries, and Gemini AI insights through a backend-owned API key.

## Features

- Account registration, login, logout, and protected routes
- Habit management for good and bad habits
- Good habit types: Checklist, Frequency, and Duration
- Bad habit type: Avoidance
- Log activity with past-date support and future-date blocking
- Daily check-in with mood, energy, and notes
- Dashboard weekly progress based on average habit progress
- Weekly summary with habit ranking, average progress, and AI insight
- Secure AI integration where Gemini credentials stay on the backend

## Tech Stack

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL / Supabase
- JWT authentication
- Gemini AI via backend service

## Project Structure

```text
Habit Tracker App/
|-- backend/
|   |-- prisma/      # Prisma schema and migrations
|   `-- src/         # Express API, services, routes, validation, tests
|-- frontend/
|   |-- app/         # Next.js app routes
|   |-- components/  # React UI components
|   |-- lib/         # API client, utilities, progress helpers
|   `-- types/       # Shared frontend TypeScript types
`-- README.md
```

## Environment Variables

Local environment files are required to run the project, but they must not be committed to GitHub.

- Backend: copy `backend/.env.example` to `backend/.env`
- Frontend: copy `frontend/.env.example` to `frontend/.env.local`
- Use `.env.example` files as templates only
- Ask a teammate for shared local credentials if needed
- Never commit real database URLs, JWT secrets, or API keys

## Backend Setup

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:validate
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

The frontend uses `NEXT_PUBLIC_API_BASE_URL` to reach the backend.

## Database and Prisma Notes

If you are using an existing shared Supabase database, do not casually run development migrations. Start with generate and validate:

```powershell
npm run prisma:generate
npm run prisma:validate
```

Only apply existing checked-in migrations to a target database when they are actually needed:

```powershell
npm run prisma:migrate:deploy
```

`prisma:migrate:deploy` applies existing migrations safely for a target database. Use development migration commands only when intentionally creating new migrations.

Same-day habit log uniqueness is currently enforced at the backend service layer for `userId + habitId + date`. A database-level unique constraint can be added later as a hardening improvement after safely cleaning any duplicate rows.

## Testing and Verification

Backend:

```powershell
cd backend
npm test
npm run prisma:validate
npm run prisma:generate
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```
