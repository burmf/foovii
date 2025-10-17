"use client";

import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

interface CartBarProps {
  onReview: () => void;
}

export function CartBar({ onReview }: CartBarProps) {
  const { subtotal, totalQuantity } = useCart();

  if (totalQuantity === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Your order
          </p>
          <p className="text-sm font-medium text-foreground">
            {totalQuantity} items · {formatCurrency(subtotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={onReview}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90"
        >
          Review order
        </button>
      </div>
    </div>
  );
}
