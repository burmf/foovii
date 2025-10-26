type StripeCheckoutPayload = {
  storeSlug: string;
  cartTotalCents: number;
  currency?: string;
};

export async function createCheckoutSession(
  payload: StripeCheckoutPayload
): Promise<{ url: string } | { error: string }> {
  // Placeholder implementation for Phase 1. This will call the real Stripe API in Phase 2.
  if (!payload.cartTotalCents || payload.cartTotalCents <= 0) {
    return { error: "amount_required" };
  }

  const query = new URLSearchParams({
    store: payload.storeSlug,
    amount: (payload.cartTotalCents / 100).toFixed(2),
    currency: payload.currency ?? "AUD",
  });

  return {
    url: `https://dashboard.stripe.com/test/payments?${query.toString()}`,
  };
}
