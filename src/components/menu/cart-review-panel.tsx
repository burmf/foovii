"use client";

import { useState } from "react";

import type { StoreConfig } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

interface CartReviewPanelProps {
  onClose: () => void;
  store: StoreConfig;
  onOrderSuccess?: (orderId: string) => void;
  onOrderError?: (message: string) => void;
}

export function CartReviewPanel({ onClose, store, onOrderSuccess, onOrderError }: CartReviewPanelProps) {
  const { lines, subtotal, totalQuantity, increment, decrement, remove, clear } =
    useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handlePlaceOrder() {
    try {
      setStatus("loading");
      setMessage(null);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: store.slug,
          items: lines.map((line) => ({
            id: line.id,
            name: line.name,
            price: line.price,
            quantity: line.quantity,
            notes: line.notes,
          })),
          subtotal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const result = (await response.json()) as { orderId?: string };
      setStatus("success");
      setMessage("Order placed. Staff dashboard will receive the ticket.");
      clear();
      onOrderSuccess?.(result.orderId ?? "mock");
      onClose();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Could not place the order. Please try again.");
      onOrderError?.("Could not place the order. Please try again.");
    }
  }

  return (
    <div className="w-full rounded-3xl bg-background shadow-lg">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Review order
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {totalQuantity} items · {formatCurrency(subtotal)}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          Close
        </button>
      </header>

      <div className="max-h-[320px] space-y-4 overflow-y-auto px-6 py-6">
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cart is empty. Add dishes to your order from the menu.
          </p>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 px-4 py-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {line.name}
                </p>
                {line.notes ? (
                  <p className="text-xs text-muted-foreground">• {line.notes}</p>
                ) : null}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => decrement(line.id)}
                    className="h-8 w-8 rounded-full border border-border text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                    aria-label={`Decrease quantity for ${line.name}`}
                  >
                    –
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-foreground">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(line.id)}
                    className="h-8 w-8 rounded-full border border-border text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                    aria-label={`Increase quantity for ${line.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(line.price * line.quantity, line.currency ?? "AUD")}
                </p>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="space-y-3 border-t border-border px-6 py-4 sm:flex sm:flex-col">
        {message ? (
          <p
            className={`text-sm ${
              status === "success" ? "text-primary" : "text-destructive"
            }`}
          >
            {message}
          </p>
        ) : null}
        <button
          type="button"
          disabled={lines.length === 0 || status === "loading"}
          onClick={handlePlaceOrder}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Placing…" : "Place order"}
        </button>
      </footer>
    </div>
  );
}
