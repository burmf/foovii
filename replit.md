# Foovii QR Ordering Platform

## Overview

Foovii is a multi-tenant AR × QR ordering SaaS for restaurants. Customers scan QR codes to access an English-language ordering interface, while staff and managers use web dashboards for real-time order management and analytics. The MVP focuses on delivering a functional ordering experience with theme customization per tenant, placeholder payment integration, and optional Supabase menu data sourcing.

## Recent Changes

### 2025-10-28: Replit Migration & Frontend Completion
- Migrated from Vercel to Replit environment
- Updated package.json scripts to bind to port 5000 and 0.0.0.0 for Replit compatibility
- Fixed Next.js 15 async params warnings (added `await params` in dynamic routes)
- Added hero images to store configurations (dodam.json, soy38.json)
- Optimized Next.js Image components with proper `sizes` prop for better performance
- Configured deployment settings for Replit autoscale deployment
- Fixed Supabase type definitions to handle both array and object category responses
- Cleared Next.js image cache and cleaned up environment variables for local-only development
- All menu images now display correctly with proper type safety

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 (App Router, React Server Components)
- **Rationale**: App Router provides optimal file-based routing for multi-tenant pages (`/menu/[storeSlug]`, `/staff`, `/manager`) with native TypeScript support and server-side data fetching
- **UI Library**: shadcn/ui (New York style preset) with Tailwind CSS v4
- **State Management**: React Context API for cart state (`CartProvider`), with Framer Motion for animations
- **Pros**: Simple architecture, built-in SSR/SSG, excellent DX with Turbopack
- **Cons**: Limited real-time capabilities without additional infrastructure

### Routing Strategy

**Multi-tenant URL structure**: `/menu/[storeSlug]` for customer-facing menus
- **Dynamic route generation**: Static params pre-generated from JSON fixtures in `stores/` directory
- **Alternative considered**: Subdomain-based routing (e.g., `dodam.foovii.com`)
- **Chosen approach rationale**: Simpler deployment, easier local development, no DNS configuration required
- **Theme injection**: CSS variables dynamically set per store via inline styles based on `store.theme` object

### Data Layer

**Dual-source menu architecture**: Local JSON fixtures with optional Supabase overlay
- **Primary source**: JSON files in `stores/` directory (`dodam.json`, `soy38.json`)
- **Secondary source**: Supabase tables (`menu_categories`, `menu_items`) with Storage bucket for images
- **Merge strategy**: `applySupabaseMenu()` in `src/lib/supabase-menu.ts` overlays Supabase data onto local fixtures when credentials are present
- **Rationale**: Allows development without database dependency while enabling production menu management
- **Fallback behavior**: Gracefully degrades to local JSON if Supabase env vars are missing

### Component Architecture

**Separation by user role**:
- `src/components/menu/` - Customer-facing ordering UI (MenuScreen, CartBar, MenuItemCard)
- `src/components/staff/` - Kitchen/staff dashboard (StaffBoard with order status columns)
- `src/components/manager/` - Analytics dashboard (ManagerDashboard with KPI cards and charts)

**Cart implementation**: 
- Context-based state management with `useReducer` for cart operations
- Cart lines include item variations via `buildLineId()` combining item ID with notes
- Persistent across component remounts within session (no localStorage in MVP)

### Payment Integration (Placeholder)

**Current implementation**: Mock Stripe client (`src/lib/stripe.ts`)
- Returns test dashboard URL with query params (store, amount, currency)
- Synchronous validation only, no network calls
- **Phase 2 roadmap**: Replace with real `stripe.checkout.sessions.create()` API calls
- **Session tracking**: To be stored in `orders` table with Supabase RLS

### Styling System

**Tailwind CSS v4** with shadcn/ui theming
- **CSS variables approach**: Theme colors injected as CSS custom properties per store
- **Design tokens**: Defined in `globals.css` under `:root`, overridden dynamically
- **Responsive strategy**: Mobile-first with breakpoints (`sm:`, `md:`, etc.)
- **Class organization convention**: Layout → spacing → colors

## External Dependencies

### UI & Animation
- **shadcn/ui**: Pre-built accessible components (Card, Button, etc.) with CVA variants
- **Framer Motion**: Animations for cart interactions, modals, toasts
- **Lucide React**: Icon library (ShoppingCart, X, etc.)
- **Recharts**: Analytics charts in Manager dashboard (Area, Line, CartesianGrid)

### Data & Storage
- **Supabase** (optional): 
  - Client SDK: `@supabase/supabase-js`
  - Tables: `menu_categories`, `menu_items` (both require `store_slug`, `published`, `sort_order`)
  - Storage: Public bucket (e.g., `menu-assets`) for product images
  - RLS: Planned for Phase 2 (currently bypassed for development)
  - Sync script: `scripts/sync-supabase-menu.ts` uploads local JSON + images to Supabase

### Payment Processing
- **Stripe** (planned): Placeholder client in place, real integration deferred to Phase 2
- **Required keys**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` (not yet configured)

### Development Tools
- **TypeScript 5**: Strict mode enabled
- **ESLint + Prettier**: Code formatting with 2-space indents, semicolons enforced
- **pnpm**: Package manager (workspace-ready for future monorepo expansion)
- **tsx**: Script runner for `sync-supabase-menu.ts`

### Environment Variables
Required in `.env.local` (see `config/.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for sync script
- `SUPABASE_STORAGE_BUCKET` - Storage bucket name (default: `menu-assets`)

### Third-Party Integrations
- **Vercel** (deployment target): Environment variables managed via project settings
- **Supabase** (optional): Menu data source and image storage
- **Stripe** (future): Payment processing via Checkout Sessions API