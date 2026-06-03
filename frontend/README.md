# Habit Flow Frontend

Dark-mode responsive frontend for Habit Flow, a weekly consistency habit tracker.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint

## Current Status

The MVP frontend is feature-complete for final QA and deployment preparation. Authentication, habit management, daily habit logging, daily check-ins, weekly summaries, Gemini-backed insight display, and the dashboard usage preview connect to the backend API.

Implemented:

- Landing page
- Real login, register, logout, token storage, current user loading, and protected routes
- Responsive app layout
- Desktop sidebar navigation
- Mobile bottom navigation
- Dashboard daily usage preview using real habits, logs, and today's check-in where available
- Habits list connected to `GET /api/habits`
- Add habit form connected to `POST /api/habits`
- Edit habit flow connected to `GET /api/habits/:id` and `PUT /api/habits/:id`
- Delete habit action connected to `DELETE /api/habits/:id`
- Log activity form connected to `GET /api/habits`, `POST /api/habit-logs`, and `POST /api/habit-logs/avoid`
- Daily check-in form connected to `GET /api/checkins/:date`, `POST /api/checkins`, and `PUT /api/checkins/:id`
- Weekly summary page connected to `GET /api/weekly-summary/current`, `GET /api/weekly-summary/:id`, and `POST /api/weekly-summary/generate`
- Gemini insight and recommendation display through backend weekly summary responses
- Settings page
- Shared UI components and frontend TypeScript types
- Refined dark-mode dashboard shell
- Loading, empty, error, and success states
- API client foundation using `NEXT_PUBLIC_API_BASE_URL`

Not implemented yet:

- Direct frontend Gemini calls, by design. Gemini remains backend-only.
- Deployment configuration and production hosting

## Run Locally

From the `frontend` folder:

```bash
npm install
npm run dev
```

On Windows PowerShell, if script execution blocks `npm`, use:

```bash
npm.cmd install
npm.cmd run dev
```

Then open:

```bash
http://localhost:3000
```

Set the backend URL with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

For local development, copy `.env.example` to `.env.local`. Do not commit `.env.local` or any file containing real secrets.

## Habit CRUD Testing

1. Start the backend on `http://localhost:5000`.
2. Start this frontend and log in.
3. Open `/habits`.
4. Create a habit from `/habits/new`.
5. Confirm it appears on `/habits`.
6. Edit the habit from its card.
7. Delete the habit from its card.
8. Refresh `/habits` and confirm the backend data persists.

## Daily Usage Testing

1. Start the backend on `http://localhost:5000`.
2. Start this frontend and log in.
3. Create a habit from `/habits/new` if the account has no habits.
4. Open `/logs/new`, choose a real habit, and submit a log.
5. Open `/check-in`, submit today's mood and energy, then submit again to confirm the existing check-in updates.
6. Open `/dashboard` and confirm active habits, daily check-in status, and today/weekly log stats render without layout issues.

## Weekly Summary Testing

1. Start the backend on `http://localhost:5000`.
2. Start this frontend and log in.
3. Make sure the account has at least one habit, one habit log, and one daily check-in.
4. Open `/weekly-summary`.
5. Click `Generate summary`.
6. Confirm ranking, progress, top habit, habits needing attention, Gemini insight, and recommendation render.
7. Refresh `/weekly-summary` and confirm the generated summary reloads from the backend.
8. Open `/dashboard` and confirm the weekly AI preview renders when available.

## Notes For Next Parts

The frontend is ready for final QA, deployment preparation, and production environment configuration.

## QA Commands

```bash
npm run lint
npm run build
```
