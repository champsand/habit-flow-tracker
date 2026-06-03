# Habit Flow Frontend

Frontend application for Habit Flow, a weekly habit tracking platform focused on progress, reflection, and AI-assisted habit insights.

This application provides the user-facing experience for authentication, habit management, activity logging, daily check-ins, dashboard analytics, weekly summaries, and account settings.

## Tech Stack

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* ESLint

## Application Overview

The frontend is built as a responsive dashboard application with protected routes and backend-driven data. It communicates with the Habit Flow API to manage user sessions, habits, logs, check-ins, and weekly summaries.

Core areas of the application include:

* Public landing page
* Login and registration flows
* Protected dashboard layout
* Habit list, creation, editing, and deletion
* Activity logging for good habits and bad habit avoidance
* Daily check-in interface
* Weekly summary and AI insight display
* Settings and account overview
* Desktop sidebar navigation and mobile bottom navigation

## Routes

```text
/
├── /login
├── /register
├── /dashboard
├── /habits
├── /habits/new
├── /habits/[id]/edit
├── /logs/new
├── /check-in
├── /weekly-summary
└── /settings
```

## Project Structure

```text
frontend/
├── app/              # Next.js routes and page entry points
├── components/       # Reusable UI and feature components
├── lib/              # API client, auth helpers, date utilities, and progress logic
├── public/           # Static assets
├── types/            # Shared TypeScript types
├── .env.example      # Environment variable template
└── package.json
```

## Configuration

Create a local environment file from the provided template:

```powershell
Copy-Item .env.example .env.local
```

Required variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

`NEXT_PUBLIC_API_BASE_URL` defines the backend API base URL used by the frontend.

Local environment files are intentionally excluded from version control. Use `.env.example` as the committed template for required configuration values.

## Getting Started

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

The backend API should be running before testing authenticated or data-driven pages.

## Quality Checks

Run linting:

```powershell
npm run lint
```

Create a production build:

```powershell
npm run build
```

A successful build confirms that the application routes, TypeScript checks, and production compilation are valid.

## Backend Integration

The frontend is designed to work with the Habit Flow backend located in:

```text
../backend
```

Backend-powered features include:

* Authentication and current-user loading
* Habit CRUD operations
* Habit log creation and updates
* Bad habit avoidance recording
* Daily check-in creation and updates
* Weekly summary retrieval and generation
* AI insight display from backend-generated summary responses

AI provider credentials are handled by the backend. The frontend only receives generated weekly insight data through the API.

## Implementation Notes

* Protected routes redirect unauthenticated users to the login flow.
* The dashboard uses backend data from habits, logs, check-ins, and weekly summaries.
* Weekly progress is based on average progress across active habits.
* Activity logs and check-ins support past dates while blocking future dates.
* Bad habits are recorded through avoidance actions.
* The interface is responsive across desktop, tablet, and mobile layouts.
