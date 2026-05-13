# Gym Membership App Project Context

This file is persistent working context for future Codex sessions in this project. Read it before making changes, keep it current, and append to the change log before finishing any work.

## Project Snapshot

- App: Yokai Gym membership management system.
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn-style UI components, lucide-react icons, SWR, Supabase.
- Package scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- Package manager state: both `package-lock.json` and `pnpm-lock.yaml` exist; confirm package manager before dependency changes.
- Repository state: this folder is not currently initialized as a Git repository.
- App language: user-facing copy is primarily Spanish.

## Architecture Notes

- Pages live under `app/`:
  - `/` dashboard with member stats, expiring members, and monthly income.
  - `/alumnos` member search, status filtering, create member, detail sheet, renewal flow, WhatsApp reminders.
  - `/pagos` payment history and monthly payment summary.
  - `/configuracion` gym settings, plans, reminder days, and message templates.
  - `/auth/login` and `/auth/callback` handle Supabase auth.
- Navigation lives in `components/navigation/desktop-sidebar.tsx` and `components/navigation/bottom-nav.tsx`.
- Shared UI components live in `components/ui/` and follow shadcn-style conventions from `components.json`.
- Domain components are grouped under `components/members/` and `components/dashboard/`.
- Core app types live in `lib/types.ts`.
- Member status/date helpers live in `lib/utils/member-status.ts`.
- Supabase access is centralized in `lib/supabase/`:
  - `database.ts` maps database rows to app types and handles members, payments, and settings.
  - `auth.ts` handles profile lookup, role helpers, sign out, and user/profile operations.
  - `client.ts`, `server.ts`, and `middleware.ts` create Supabase clients for browser/server/middleware usage.
- Data fetching in client pages uses SWR keys such as `members`, `payments`, and `settings`; after writes, call `mutate` for affected keys.

## Data And Access Model

- Implied Supabase tables: `members`, `payments`, `settings`, and `profiles`.
- App-level types:
  - `Member` uses camelCase fields and maps to snake_case database columns.
  - `Payment` uses `memberId`, `memberName`, `amount`, `method`, `date`, and `concept`.
  - `Settings` includes `gymName`, `reminderDays`, `plans`, and `messageTemplates`.
  - `UserRole` is `admin` or `trainer`.
- Middleware requires authentication for non-auth/static/API routes.
- Trainers are redirected to `/alumnos` and can only access that route.
- Admin-only routes include `/configuracion` and `/usuarios`.

## Known Gaps And Risks

- `/usuarios` is listed in navigation and middleware but no `app/usuarios/page.tsx` exists.
- `next.config.mjs` currently has `typescript.ignoreBuildErrors: true`; do not assume builds catch all type issues.
- Supabase schema/migrations are not present in the inspected project tree.
- Defaults in `getSettings()` are used when the settings row is missing.
- The app has generated/v0-style metadata and placeholder assets in `public/`.

## Working Directive

- Always read this context before making changes in this project.
- Always append a dated change log entry before ending a coding session.
- The log entry must include what changed, files touched, verification run, and any known risks or follow-ups.
- Never skip logging, even for small edits or documentation-only changes.
- Preserve Spanish app copy unless the requested change says otherwise.
- Keep changes scoped to the requested behavior and existing architecture.
- Prefer existing UI components and lucide icons over new custom primitives.

## Change Log

### 2026-05-12 - Initial Context Capture

- Changed: explored the project structure and documented architecture, conventions, risks, and the standing logging directive.
- Files: `PROJECT_CONTEXT.md`, `/home/advanta/.codex/memories/gym-membership-app.md`.
- Verified: non-mutating file inspection during planning; markdown files created during implementation.
- Notes/Risks: no app behavior changed; current project folder is not a Git repository.

### 2026-05-12 - Environment And Repository Prep

- Changed: added a placeholder `.env` with required Supabase public variables and prepared the project for initial repository publishing.
- Files: `.env`, `PROJECT_CONTEXT.md`, `/home/advanta/.codex/memories/gym-membership-app.md`.
- Verified: inspected environment variable usage and GitHub publish prerequisites; attempted `npm run lint`.
- Notes/Risks: `.env` contains placeholders only; `npm run lint` fails because `eslint` is not installed; GitHub CLI `gh` is not installed, so remote repo creation/push cannot be completed from this environment yet.

### 2026-05-13 - Profiles RLS Recursion Fix

- Changed: added a Supabase migration to replace recursive `profiles` policies with policies backed by a `SECURITY DEFINER` admin helper, and removed a middleware debug log that printed profile lookup details.
- Files: `supabase/migrations/20260513000000_fix_profiles_rls_recursion.sql`, `middleware.ts`, `PROJECT_CONTEXT.md`.
- Verified: `npx tsc --noEmit` passes; `npm run lint` still fails because `eslint` is not installed.
- Notes/Risks: the migration must be applied to the Supabase database before the runtime `42P17` error is fixed; no linked Supabase CLI project is present in this workspace.
