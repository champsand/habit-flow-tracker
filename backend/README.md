# Habit Flow Backend

Habit Flow is a responsive web habit tracker focused on weekly consistency instead of pressure-heavy daily streaks. This backend provides the API for authentication, habit management, habit logs, daily check-ins, weekly summaries, and short Gemini-powered weekly insights.

The project is intentionally practical: clean enough for real deployment, but still understandable for a university project.

## Stack

- Node.js and Express
- PostgreSQL with Prisma ORM
- JWT authentication
- bcrypt password hashing
- Gemini API integration
- node-cron scheduler
- Helmet security headers
- Express rate limiting
- Node's built-in test runner

## Project Structure

```text
backend/
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |-- controllers/
|   |-- jobs/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- schemas/
|   |-- services/
|   |-- tests/
|   `-- utils/
|-- .env.example
|-- package.json
`-- README.md
```

## Architecture

- `routes/` defines the `/api/...` endpoint layout.
- `controllers/` handle request and response flow.
- `services/` contain business logic and Prisma access.
- `schemas/` contain lightweight request validation.
- `middleware/` handles auth, CORS, validation, and errors.
- `jobs/` contains scheduler entry points such as daily recap checks.
- `utils/` contains shared date, token, scoring, and response helpers.

The API uses user-scoped data access throughout protected routes so users can only access their own habits, logs, check-ins, and summaries.

## Security

Practical security measures included for the MVP:

- `app.disable("x-powered-by")` hides the Express fingerprint.
- Helmet adds common HTTP security headers.
- CORS is configured through `CORS_ALLOWED_ORIGINS` and allows localhost frontend origins during development.
- General API, auth, and AI routes have configurable rate limits.
- JWT auth protects user-specific routes.
- Logout invalidates existing tokens through `tokenVersion`.
- Services enforce user ownership before reading or changing records.
- Request schemas validate auth, habits, logs, check-ins, dates, enums, and numeric fields.
- Error responses stay JSON-formatted and production mode hides internal server details.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Environment Variables

Create `.env` from `.env.example`. Do not commit `.env`.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode, usually `development`, `test`, or `production`. |
| `PORT` | API port. Defaults to `5000`. |
| `API_PREFIX` | API route prefix. Defaults to `/api`. |
| `APP_TIME_ZONE` | App date boundary for today/check-in and habit log date checks. Defaults to `Asia/Jakarta`. |
| `DATABASE_URL` | Required PostgreSQL connection string. Use the Supabase connection string for real persistence. |
| `JWT_SECRET` | Long random secret for signing tokens. Required in production. |
| `JWT_EXPIRES_IN` | Token lifetime, for example `7d`. |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost. Defaults to `10`. |
| `JSON_BODY_LIMIT` | Maximum JSON request body size. Defaults to `100kb`. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins such as `http://localhost:5173`. |
| `CORS_ALLOW_CREDENTIALS` | Set to `true` only if browser credential requests are needed. |
| `GENERAL_RATE_LIMIT_WINDOW_MS` | General API rate-limit window in milliseconds. |
| `GENERAL_RATE_LIMIT_MAX` | Max general API requests per window. |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Auth route rate-limit window in milliseconds. |
| `AUTH_RATE_LIMIT_MAX` | Max login/register attempts per window. |
| `AI_RATE_LIMIT_WINDOW_MS` | AI route rate-limit window in milliseconds. |
| `AI_RATE_LIMIT_MAX` | Max AI insight requests per window. |
| `SCHEDULER_ENABLED` | Set to `false` to disable scheduled jobs. |
| `DAILY_RECAP_CRON` | Cron expression for daily recap checks. Defaults to `0 21 * * *`. |
| `GEMINI_API_KEY` | Gemini API key. If missing, the API returns safe fallback insights. |
| `GEMINI_MODEL` | Gemini model name. Defaults to `gemini-2.0-flash`. |
| `GEMINI_TEMPERATURE` | Gemini response creativity. Defaults to `0.3`. |
| `GEMINI_MAX_OUTPUT_TOKENS` | Gemini output limit. Defaults to `220`. |

## Supabase and Prisma

The Prisma schema is configured for PostgreSQL and includes a checked-in initial migration under `prisma/migrations`.

Prisma 7 stores the connection URL in `prisma.config.ts`, not inside `schema.prisma`. The project still uses `DATABASE_URL` as the single environment variable for the database connection.

For Supabase:

1. Create a Supabase project.
2. Copy the PostgreSQL connection string from Supabase.
3. Put it in `.env` as `DATABASE_URL`.
4. Run `npm run prisma:generate`.
5. Run `npm run prisma:migrate:deploy` to apply checked-in migrations.

If your direct Supabase URL on port `5432` is unreachable from your machine or host, use Supabase's pooled connection string for `DATABASE_URL`. The backend has been verified against Supabase once the URL is reachable.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:studio
```

Use `npm run prisma:migrate` during local development when creating new migrations. Use `npm run prisma:migrate:deploy` for Supabase, staging, or production-style environments.

## API Routes

Health and readiness:

- `GET /health`
- `GET /api`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Habits and logs:

- `GET /api/habits`
- `POST /api/habits`
- `GET /api/habits/:id`
- `PUT /api/habits/:id`
- `DELETE /api/habits/:id`
- `GET /api/habit-logs`
- `POST /api/habit-logs`
- `POST /api/habit-logs/avoid`
- `GET /api/habit-logs/:id`
- `PUT /api/habit-logs/:id`
- `DELETE /api/habit-logs/:id`

Check-ins and weekly summaries:

- `GET /api/checkins`
- `POST /api/checkins`
- `GET /api/checkins/:date`
- `PUT /api/checkins/:id`
- `GET /api/weekly-summary/current`
- `GET /api/weekly-summary/:weekId`
- `POST /api/weekly-summary/generate`
- `POST /api/ai/insight/generate`

Protected routes require:

```text
Authorization: Bearer <token>
```

Successful API responses include `status: "success"` plus the route payload. Errors use `status: "error"` with a clear `message` and optional validation `details`.

`GET /api/habit-logs` supports optional `habitId`, `date`, `startDate`, and `endDate` query filters. Dates use `YYYY-MM-DD`.

Same-day habit log replacement is enforced in the service layer for `userId + habitId + date`, so resubmitting a log updates the effective daily state instead of double-counting progress. A database-level unique constraint for this combination can be added later as a hardening improvement after safely cleaning any existing duplicates.

## Gemini Insights

Gemini is isolated in `src/services/aiInsightService.js`. The service asks for compact JSON with:

- `insightText`
- `recommendationText`

Responses are normalized and kept short for the frontend. If Gemini is not configured or the API call fails, the backend returns a deterministic fallback insight instead of failing the weekly summary flow.

## Scheduler

The scheduler is started from `src/server.js` and currently runs the daily recap job. The daily recap job identifies users who have not submitted today's check-in and logs the candidate count.

Notification delivery is intentionally not implemented yet. Future email, push, or in-app notification delivery can be added inside `src/jobs/dailyRecapJob.js` without changing the API routes.

Disable scheduled jobs locally or in tests with:

```env
SCHEDULER_ENABLED=false
```

## Tests

```bash
npm test
```

`npm test` runs unit and route tests without touching the database. Database integration tests are opt-in so they do not accidentally write to a shared Supabase database.

To verify real database persistence:

```powershell
$env:RUN_DB_TESTS="true"
npm run test:db
```

On macOS/Linux:

```bash
RUN_DB_TESTS=true npm run test:db
```

The database tests create temporary users, habits, habit logs, daily check-ins, and weekly summaries, then clean them up.

## Manual API Testing

Use Thunder Client, Postman, or a similar tool. Set the base URL to your running backend, for example:

```text
http://localhost:5000
```

If your `.env` uses another `PORT`, use that port instead.

1. Health check
   `GET /health`

2. Register
   `POST /api/auth/register`

   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. Login
   `POST /api/auth/login`

   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

4. Copy the `token` from the login response.

5. For protected requests, add:

   ```text
   Authorization: Bearer <token>
   ```

6. Current user
   `GET /api/auth/me`

7. Create habit
   `POST /api/habits`

   ```json
   {
     "name": "Study",
     "type": "frequency",
     "category": "good",
     "weeklyTarget": 5
   }
   ```

8. List habits
   `GET /api/habits`

9. Create habit log
   `POST /api/habit-logs`

   ```json
   {
     "habitId": "<habit-id>",
     "date": "2026-05-13",
     "amount": 1,
     "note": "Completed one session"
   }
   ```

10. Create daily check-in
    `POST /api/checkins`

    ```json
    {
      "date": "2026-05-13",
      "mood": "good",
      "energy": "medium",
      "note": "Good progress today"
    }
    ```

11. Generate weekly summary
    `POST /api/weekly-summary/generate`

    ```json
    {
      "weekDate": "2026-05-13"
    }
    ```

12. Generate AI insight preview
    `POST /api/ai/insight/generate`

    ```json
    {
      "weekDate": "2026-05-13"
    }
    ```

## Development Notes

- Keep new endpoints under `/api`.
- Keep sensitive values in environment variables.
- Keep business logic in services, not controllers.
- Keep AI responses short and frontend-friendly.
- Avoid committing `node_modules`, `.env`, logs, coverage, or local archives.
- Never copy real secrets into `.env.example`; rotate secrets if a real `.env` file was shared.

## Creating a Clean Source Zip

Before sharing the project folder, make sure the archive does not include:

- `backend/node_modules/`
- `frontend/node_modules/`
- `frontend/.next/`
- `dist/`, `build/`, `coverage/`, `.turbo/`, or `.cache/`
- `backend/logs/`, `frontend/logs/`, or `*.log`
- old `*.zip` files
- `backend/.env`, `frontend/.env.local`, or any real `.env.*` file

Keep `.env.example` files in the zip. Do not delete your local `.env` files unless you intentionally want to recreate them; just exclude them from the shared archive.

Manual PowerShell cleanup for generated folders:

```powershell
Remove-Item -Recurse -Force backend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend\logs -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\logs -ErrorAction SilentlyContinue
Remove-Item -Force *.zip -ErrorAction SilentlyContinue
Remove-Item -Force backend\*.log -ErrorAction SilentlyContinue
Remove-Item -Force frontend\*.log -ErrorAction SilentlyContinue
```

After cleanup, restore and run the backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Restore and run the frontend:

```bash
cd frontend
npm install
npm run dev
```
