"use client";

import { useState } from "react";

import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface MenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, notes?: string) => void;
}

export function MenuItemModal({ item, onClose, onAdd }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center">
      <div className="w-full max-w-lg rounded-3xl bg-background shadow-lg">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Item detail
            </p>
            <h2 className="text-xl font-semibold text-foreground">{item.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Close
          </button>
        </header>
        <div className="space-y-6 px-6 py-6">
          {item.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="h-10 w-10 rounded-full border border-border text-lg font-semibold text-foreground transition hover:border-primary hover:text-primary"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="w-8 text-center text-lg font-semibold text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="h-10 w-10 rounded-full border border-border text-lg font-semibold text-foreground transition hover:border-primary hover:text-primary"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(item.price * quantity, item.currency ?? "AUD")}
            </p>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Notes for kitchen
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add instructions (optional)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
        <footer className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onAdd(item, quantity, notes.trim() || undefined);
              onClose();
            }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:bg-primary/90"
          >
            Add to order ·{" "}
            {formatCurrency(item.price * quantity, item.currency ?? "AUD")}
          </button>
        </footer>
      </div>
    </div>
  );
}
