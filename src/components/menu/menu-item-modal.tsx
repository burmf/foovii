"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ArViewer } from "./ar-viewer";

interface MenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, notes?: string) => void;
}

export function MenuItemModal({ item, onClose, onAdd }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [showAr, setShowAr] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="w-full max-w-lg rounded-3xl bg-background shadow-lg"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Item image (render if available) */}
          {item.image ? (
            <div className="relative h-52 w-full overflow-hidden rounded-t-3xl bg-secondary">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-cover"
                priority
              />
              {/* Close button (overlaid on image) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : null}
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Item detail
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {item.name}
              </h2>
            </div>
            {!item.image ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                ✕
              </button>
            ) : null}
          </header>
          <div className="space-y-6 px-6 py-6">
            {item.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}

            {/* AR / 3D button */}
            {item.modelUrl ? (
              <button
                type="button"
                onClick={() => setShowAr(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                {/* cube icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                View in AR / 3D
              </button>
            ) : null}

            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-lg font-bold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center text-lg font-bold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.price, item.currency ?? "AUD")} each
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(item.price * quantity, item.currency ?? "AUD")}
                </p>
              </div>
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

      {/* AR viewer (delegates to OS on iOS, overlay on Android/PC) */}
      {showAr && item.modelUrl ? (
        <ArViewer
          modelUrl={item.modelUrl}
          modelUrlUsdz={item.modelUrlUsdz}
          itemName={item.name}
          onClose={() => setShowAr(false)}
        />
      ) : null}
    </>
  );
}
