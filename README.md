## Foovii Ordering MVP

This repository hosts the Foovii MVP: an English-only AR × QR ordering experience for multi-tenant restaurants.  
Primary references live under `docs/`, including:

- `docs/yoken` — Japanese SRS (scope contract)
- `docs/dodam-menu.md` — Dodam Melbourne pickup menu snapshot
- `docs/AGENTS.md` — contributor guidelines

## Tech Stack

- Next.js 15 (App Router, TypeScript, Tailwind v4)
- shadcn UI primitives (`components.json`)
- pnpm workspace (to be expanded with apps/packages)

## Development

```bash
pnpm install          # ensure dependencies
pnpm dev              # start local dev server on http://localhost:3000
pnpm lint             # ESLint + Prettier formatting
```

The initial milestone focuses on recreating the Dodam pickup layout under `/menu/[storeSlug]`. Follow `docs/todo.md` for task-level progress and keep UI copy in English.
