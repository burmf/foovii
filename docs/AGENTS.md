# Repository Guidelines

## Project Structure & Module Organization
- As of Oct 17 2025, `docs/yoken` holds the Foovii SRS; treat it as the scope contract and attach relevant section links in PRs.
- Scaffold apps under `apps/menu/` (guest ordering) and `apps/staff/` (operations dashboard) with features in `src/modules/`.
- Share domain logic in `packages/core/` and reusable UI in `packages/ui/`; keep assets in `public/assets/` and e2e suites in `tests/`.
- Commit environment samples to `config/.env.example` and tenant themes to `config/stores/*.json`.

## Build, Test, and Development Commands
- `pnpm install` — install workspaces and hooks; run after syncing with `main`.
- `pnpm dev --filter apps/menu` (or `apps/staff`) — launch the respective Next.js dev server with hot reload.
- `pnpm build` — create production bundles, blocking on lint or type failures.
- `pnpm lint --fix` — apply ESLint + Prettier rules and format the workspace.
- `pnpm test` — run Vitest suites; append `--runInBand` when chasing flakes.
- `pnpm exec playwright test` — exercise guest checkout and staff status transitions end to end.

## Coding Style & Naming Conventions
- Use TypeScript with 2-space indentation, semicolons, single quotes in TS/JS, double quotes in JSON.
- Enforce ESLint (`@next/eslint-plugin-next`) and Prettier defaults; never bypass lint on commit.
- Name components `PascalCase.tsx`, hooks/utilities `camelCase.ts`, and route segments kebab-case.
- Group Tailwind classes by layout → spacing → color; centralize tokens inside `packages/ui/theme.ts`.
- Keep all code comments, documentation, and UI copy in English to stay consistent across teams and tenants.

## Testing Guidelines
- Co-locate Vitest + Testing Library specs in `__tests__` folders beside feature modules.
- Keep Playwright suites in `tests/e2e`; automate guest happy path and staff fulfilment loop.
- Maintain ≥80% line coverage on critical modules (`order`, `payments`, `tenant-config`) and publish coverage from CI.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`); keep subjects ≤72 chars and add context in the body when needed.
- Rebase on `main` before pushing; avoid merge commits.
- Each PR must outline the problem, list verification commands, and attach UI evidence when visuals change; mention tenant fixtures touched.
- Request a domain reviewer plus a cross-team reviewer and wait for lint, test, and e2e checks to pass.

## Environment & Security Notes
- Never commit `.env.local`; share secrets via the secure vault.
- Enable Supabase RLS before launch and document temporary bypass flags in `SECURITY.md`.
- Validate menu JSON uploads with shared Zod schemas to prevent tenant cross-talk.
- Copy `config/.env.example` to `.env.local` and populate `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; store real keys in the secret manager, not in Git.
