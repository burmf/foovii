import Link from "next/link";

import { getAllStoreConfigs } from "@/lib/getStoreConfig";
import type { StoreConfig } from "@/lib/types";
import type { CSSProperties } from "react";

function getStorePreviewStyle(store: StoreConfig) {
  return {
    "--preview-primary": store.theme.primary,
    "--preview-accent": store.theme.accent,
    "--preview-background": store.theme.background,
  } as CSSProperties;
}

export default async function Home() {
  const stores = await getAllStoreConfigs();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 sm:py-20">
        <header className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Foovii QR Ordering
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Scan. Browse. Order.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Use the QR code at your table to open the menu instantly. Prefer
              to preview first? Choose a venue below to explore the live guest
              experience.
            </p>
          </div>
          <ol className="flex flex-col gap-3 rounded-3xl border border-dashed border-border/70 bg-secondary/40 p-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <li className="flex items-start gap-3">
              <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                1
              </span>
              <span>Scan the QR code or tap a store link.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                2
              </span>
              <span>Browse the menu, customise dishes, add to cart.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                3
              </span>
              <span>Place order – staff receive it instantly on Foovii.</span>
            </li>
          </ol>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Available Venues
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {stores.length} ready
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {stores.map((store) => (
              <Link
                key={store.slug}
                href={`/menu/${store.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card transition hover:border-primary/70 hover:shadow-xl"
                style={getStorePreviewStyle(store)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--preview-background)] via-white/30 to-[var(--preview-accent)] opacity-70 transition group-hover:opacity-90" />
                <div className="relative flex h-full min-h-[200px] flex-col justify-between p-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {store.slug}
                    </p>
                    <h3 className="text-2xl font-semibold text-foreground">
                      {store.displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {store.address}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-primary">
                    <span>Open live menu</span>
                    <span aria-hidden className="text-lg">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
