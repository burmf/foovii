# Payments Integration (Phase 2 Preview)

Foovii ships with a placeholder Stripe client so the frontend wiring can be validated before real
payments go live.

## Current Behaviour (Phase 1)
- `src/lib/stripe.ts` exports `createCheckoutSession`, which validates the cart total and returns a
  link to the Stripe test dashboard.
- No network calls hit Stripe yet; the function is synchronous and safe to invoke in development.
- Use this placeholder for UI demos only. Do **not** share test URLs with customers.

## Extending to Real Stripe (Phase 2)
1. Instantiate the official `Stripe` SDK with the secret key (server-side only).
2. Replace the placeholder logic with a call to `stripe.checkout.sessions.create`.
3. Persist session IDs in Supabase (`orders` table) so `/staff` can react to payment status.
4. Store Stripe keys in the secret manager and surface customer-facing URLs via API routes, not the
   client bundle.

Consult the TODO roadmap in `docs/todo.md` when promoting this module to production use.
