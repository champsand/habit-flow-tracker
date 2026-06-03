# Habit Flow

Habit Flow is a full-stack habit tracking application designed to help users build consistency through weekly goals, daily reflection, and AI-assisted insights.

Unlike traditional habit trackers that focus heavily on daily streak pressure, Habit Flow emphasizes weekly progress. Users can track good habits, record successful bad habit avoidance, submit mood and energy check-ins, and review their weekly performance through a structured dashboard and AI-generated summary.

## Overview

Habit Flow was built as a complete full-stack web application with authentication, database persistence, habit progress tracking, daily check-ins, weekly analytics, and backend-managed AI integration.

The project focuses on three main ideas:

* **Weekly consistency over perfection** — progress is measured across the week, not lost because of one missed day.
* **Context-aware reflection** — mood, energy, and notes help explain why progress changes.
* **Practical AI insight** — weekly summaries turn habit data into simple recommendations.

## Key Features

* User authentication with protected routes
* Good habit tracking with multiple goal types:

  * Checklist
  * Frequency
  * Duration
* Bad habit tracking through avoidance goals
* Activity logging with support for past dates and future-date validation
* Daily check-ins for mood, energy, and personal notes
* Dashboard with weekly progress, habit progress, check-in status, and active-day streaks
* Weekly summary with habit ranking, average progress, and AI-generated insight
* Backend-managed Gemini AI integration to keep API credentials outside the frontend
* Account-based data ownership so users only access their own data

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* JWT authentication
* Gemini AI API

## Architecture

```text
User
  |
  v
Next.js Frontend
  |
  v
Express Backend API
  |
  +--> PostgreSQL Database via Prisma
  |
  +--> Gemini AI API
```

The frontend handles the user interface and communicates with the backend through API requests. The backend manages authentication, validation, database operations, ownership checks, weekly summary generation, and AI integration.

AI requests are handled only from the backend so provider credentials are never exposed to the browser.

## Project Structure

```text
Habit Tracker App/
├── backend/
│   ├── prisma/       # Prisma schema and database migrations
│   └── src/          # API routes, controllers, services, validation, and tests
├── frontend/
│   ├── app/          # Next.js application routes
│   ├── components/   # Reusable UI components
│   ├── lib/          # API client, utilities, and progress helpers
│   └── types/        # TypeScript type definitions
└── README.md
```

## Getting Started

### Prerequisites

* Node.js
* npm
* PostgreSQL database
* Gemini API key

### Backend Setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
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

### Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

The project uses separate environment files for the backend and frontend.

Backend:

```text
backend/.env
```

Frontend:

```text
frontend/.env.local
```

Template files are provided:

```text
backend/.env.example
frontend/.env.example
```

Real secrets such as database URLs, JWT secrets, and API keys should remain in local environment files and should not be committed to GitHub.

## Verification

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

## Security Considerations

Habit Flow includes several backend security practices:

* Passwords are hashed before storage
* JWT is used for protected routes
* User ownership checks are enforced on account data
* AI API keys are kept on the backend
* Request validation is applied before service execution
* Basic security middleware and rate limiting are used on the API server

## Status

Habit Flow is currently developed as a full-stack academic software engineering project. The application includes the core product flow from account creation to habit tracking, daily check-ins, dashboard analytics, and weekly AI summaries.
