# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── gym-tracker/        # React Gym Tracker frontend (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application

**Gym Tracker** - A full-stack workout tracking app with:
- Dashboard with stats (streaks, total volume, workout count, favorite exercise)
- Workouts page: create, list, view and delete workouts
- Workout detail: add/edit/remove sets per exercise
- Exercises: browse 35+ pre-loaded exercises by muscle group, add custom ones
- Routines: create workout templates with exercises, sets and reps defaults

## Database Schema

- `exercises` — exercise catalog (pre-seeded with 35+ exercises)
- `workouts` — workout sessions
- `workout_sets` — individual sets within a workout (exercise, reps, weight)
- `routines` — workout templates
- `routine_exercises` — exercises within a routine with defaults

## API Endpoints

- `GET/POST /api/workouts`
- `GET/PUT/DELETE /api/workouts/:id`
- `POST /api/workouts/:id/sets`
- `PUT/DELETE /api/sets/:id`
- `GET/POST /api/exercises`
- `GET/POST /api/routines`
- `GET/DELETE /api/routines/:id`
- `GET /api/stats`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/gym-tracker` (`@workspace/gym-tracker`)

React + Vite frontend at `/`. Uses React Query hooks from `@workspace/api-client-react`.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`. Uses `@workspace/api-zod` for validation and `@workspace/db` for persistence.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM. Push schema: `pnpm --filter @workspace/db run push`

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec + Orval codegen. Run: `pnpm --filter @workspace/api-spec run codegen`
