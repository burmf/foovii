# Changelog — Foovii MVP
## 2025-11-01

- Defined Supabase `orders` schema, RLS policies, and analytics views (`supabase/sql/orders-schema.sql`, `supabase/migrations/001_create_orders.sql`).
- Manager analytics now sources hourly data from `order_metrics_view` for consistent reporting with Supabase.
- Added CLI helpers (`pnpm db:apply-orders`, `pnpm db:seed-orders`) and refreshed documentation/todo items for the Supabase orders migration.
- Enabled Supabase MCP integration via remote server configuration (`.codex/config.toml`) for browsing database metadata from Codex.
- TSX-based maintenance scripts now auto-load `.env.local`, so Supabase credentials are picked up without manual export.

## 2025-10-29

- Manager dashboard now features tabbed navigation with the new Order History view, including search, status/date filters, pagination, and a detail modal.
- Added `/api/orders/history` plus supporting `getOrderHistory` data access for filtered, paginated history retrieval.
- Staff board actions moved into a context menu with an explicit cancellation confirmation modal to reduce accidental cancellations.

## 2025-10-27

- Added mock `/api/orders` endpoint with logging and deterministic response for MVP flows.
- Implemented menu toast notifications, Stripe placeholder module, and Prettier tooling.
- Documented Supabase sync workflow and contributor guide updates (`docs/AGENTS.md`).
