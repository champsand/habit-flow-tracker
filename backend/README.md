# Habit Flow Backend

Backend API service for Habit Flow, a weekly habit tracking application with authentication, habit management, activity logging, daily check-ins, weekly summaries, and AI-assisted habit insights.

The backend is responsible for authentication, request validation, data ownership, persistence, weekly progress calculation, and Gemini AI integration. The frontend communicates with this service through REST API endpoints.

## Tech Stack

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* JWT authentication
* bcrypt password hashing
* Gemini AI API
* Helmet
* Express rate limiting
* Node.js test runner

## Project Structure

```text
backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── tests/
│   └── utils/
├── .env.example
├── package.json
└── README.md
```

## Architecture

The backend follows a layered structure:

* `routes/` defines the API endpoints.
* `controllers/` handle request and response flow.
* `services/` contain business logic and database operations.
* `models/` wrap Prisma access patterns.
* `schemas/` validate incoming request payloads.
* `middleware/` handles authentication, validation, CORS, rate limiting, and errors.
* `utils/` contains shared helpers for dates, tokens, scoring, and responses.
* `jobs/` contains scheduled background job entry points.

Protected routes use authenticated user context, and service-level ownership checks ensure users can only access their own data.

## Core Capabilities

* User registration, login, logout, and current-user retrieval
* JWT-based protected routes
* Habit creation, update, listing, and deletion
* Good habit support for checklist, frequency, and duration goals
* Bad habit tracking through avoidance logs
* Habit log filtering by habit, date, and date range
* Daily check-ins with mood, energy, and notes
* Weekly summary generation based on habit logs and check-ins
* Gemini-generated weekly insight and recommendation text
* Backend fallback insight when Gemini is unavailable
* Scheduled daily recap check job

## Environment Configuration

Create a local environment file from the provided template:

```powershell
Copy-Item .env.example .env
```

Required and commonly used variables:

| Variable                       | Description                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| `NODE_ENV`                     | Runtime environment, such as `development`, `test`, or `production`. |
| `PORT`                         | API server port. Defaults to `5000`.                                 |
| `API_PREFIX`                   | API route prefix. Defaults to `/api`.                                |
| `APP_TIME_ZONE`                | Timezone used for date boundaries. Defaults to `Asia/Jakarta`.       |
| `DATABASE_URL`                 | PostgreSQL connection string.                                        |
| `JWT_SECRET`                   | Secret used to sign JWT access tokens.                               |
| `JWT_EXPIRES_IN`               | Token lifetime, such as `7d`.                                        |
| `BCRYPT_SALT_ROUNDS`           | Password hashing cost.                                               |
| `CORS_ALLOWED_ORIGINS`         | Comma-separated list of allowed frontend origins.                    |
| `GENERAL_RATE_LIMIT_WINDOW_MS` | General API rate limit window.                                       |
| `GENERAL_RATE_LIMIT_MAX`       | General API request limit per window.                                |
| `AUTH_RATE_LIMIT_WINDOW_MS`    | Authentication rate limit window.                                    |
| `AUTH_RATE_LIMIT_MAX`          | Authentication request limit per window.                             |
| `AI_RATE_LIMIT_WINDOW_MS`      | AI endpoint rate limit window.                                       |
| `AI_RATE_LIMIT_MAX`            | AI request limit per window.                                         |
| `SCHEDULER_ENABLED`            | Enables or disables scheduled jobs.                                  |
| `DAILY_RECAP_CRON`             | Cron expression for daily recap checks.                              |
| `GEMINI_API_KEY`               | Gemini API key used by backend services.                             |
| `GEMINI_MODEL`                 | Gemini model name.                                                   |
| `GEMINI_TEMPERATURE`           | Gemini response temperature.                                         |
| `GEMINI_MAX_OUTPUT_TOKENS`     | Gemini response token limit.                                         |

Local environment files are excluded from version control. Use `.env.example` as the committed configuration template.

## Local Development

Install dependencies:

```powershell
npm install
```

Generate the Prisma client:

```powershell
npm run prisma:generate
```

Validate the Prisma schema:

```powershell
npm run prisma:validate
```

Start the development server:

```powershell
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/health
```

## Database and Prisma

The backend uses Prisma with PostgreSQL. The Prisma schema and migrations are located in:

```text
prisma/
```

Useful Prisma commands:

```powershell
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:studio
```

Use `npm run prisma:migrate` when creating new migrations during local development.

Use `npm run prisma:migrate:deploy` when applying existing checked-in migrations to a target database.

Prisma 7 uses `prisma.config.ts` for loading the database connection configuration. The project still uses `DATABASE_URL` as the environment variable for the PostgreSQL connection string.

## API Overview

Health:

```text
GET /health
GET /api
```

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Habits:

```text
GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PUT    /api/habits/:id
DELETE /api/habits/:id
```

Habit logs:

```text
GET    /api/habit-logs
POST   /api/habit-logs
POST   /api/habit-logs/avoid
GET    /api/habit-logs/:id
PUT    /api/habit-logs/:id
DELETE /api/habit-logs/:id
```

Check-ins:

```text
GET  /api/checkins
POST /api/checkins
GET  /api/checkins/:date
PUT  /api/checkins/:id
```

Weekly summaries:

```text
GET  /api/weekly-summary/current
GET  /api/weekly-summary/:weekId
POST /api/weekly-summary/generate
```

AI insight:

```text
POST /api/ai/insight/generate
```

Protected endpoints require:

```text
Authorization: Bearer <token>
```

Successful responses use a consistent JSON response shape with `status: "success"`. Error responses use `status: "error"` with a message and optional validation details.

## Habit Log Behavior

Habit logs support date-based tracking for multiple habit types:

* Checklist habits store completed or not-completed daily state.
* Frequency habits store count-based progress.
* Duration habits store minute-based progress.
* Bad habits are recorded through the avoidance endpoint.

Same-day habit log replacement is enforced at the service layer for `userId`, `habitId`, and `date`. Re-submitting a log for the same habit and date updates the effective daily state instead of double-counting progress.

## Weekly Summary Behavior

Weekly summaries are calculated from active habits, habit logs, and check-ins within the selected week.

The current summary endpoint refreshes runtime progress data without automatically calling Gemini. AI text is generated or refreshed through the summary generation endpoint.

This keeps dashboard and summary progress up to date while preventing unnecessary AI API calls during normal page loads.

## Gemini Integration

Gemini integration is handled by the backend service layer. The frontend does not call Gemini directly.

The AI service generates compact weekly insight and recommendation text based on habit progress and check-in context. If Gemini is not configured or the request fails, the backend returns a deterministic fallback response so the weekly summary flow remains available.

## Scheduled Jobs

The scheduler starts from `src/server.js` when enabled. The daily recap job checks for users who have not submitted a check-in for the current day.

Scheduled jobs can be disabled with:

```env
SCHEDULER_ENABLED=false
```

## Security

The backend includes practical security controls for the API layer:

* Password hashing with bcrypt
* JWT authentication for protected routes
* Token invalidation on logout through token versioning
* User ownership checks in protected services
* Request validation before service execution
* Helmet security headers
* Configurable CORS origins
* General, authentication, and AI route rate limiting
* Production error responses that avoid exposing internal details
* Backend-owned AI credentials

## Testing

Run the backend test suite:

```powershell
npm test
```

Run Prisma validation:

```powershell
npm run prisma:validate
```

Generate Prisma client:

```powershell
npm run prisma:generate
```

Database integration tests are opt-in so they do not run against a database unintentionally.

PowerShell:

```powershell
$env:RUN_DB_TESTS="true"
npm run test:db
```

macOS/Linux:

```bash
RUN_DB_TESTS=true npm run test:db
```
