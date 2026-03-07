import Link from "next/link";
import type { CSSProperties } from "react";
import { getAllStoreConfigs } from "@/lib/getStoreConfig";
import type { StoreConfig } from "@/lib/types";
import { QrCodeCard } from "@/components/menu/qr-code-card";

interface DemoPageProps {
    searchParams?: Promise<{ host?: string }>;
}

export const metadata = {
    title: "Foovii Demo Venues",
    description: "Dodam Melbourne と Istanbul Kebab House のデモメニューをご覧いただけます。",
    robots: { index: false },
};

const DEMO_SLUGS = ["dodam", "kebab", "southern-xross", "pizza"];

function getCardStyle(store: StoreConfig) {
    return {
        "--card-primary": store.theme.primary,
        "--card-secondary": store.theme.secondary,
        "--card-accent": store.theme.accent,
    } as CSSProperties;
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
    const params = await searchParams;
    const hostOverride = params?.host;
    const baseUrl = hostOverride ? `http://${hostOverride}` : null;

    const all = await getAllStoreConfigs();
    const stores = all.filter((s) => DEMO_SLUGS.includes(s.slug));

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 sm:py-20">
                {/* ヘッダー */}
                <header className="space-y-6">
                    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Foovii · Demo
                    </span>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                            Demo Venues
                        </h1>
                        <p className="max-w-2xl text-base text-muted-foreground">
                            Experience Foovii’s live menu ordering — tap a venue card below to open the
                            guest-facing order screen.
                        </p>
                    </div>

                    {/* ステップ案内 */}
                    <ol className="flex flex-col gap-3 rounded-3xl border border-dashed border-border/70 bg-secondary/40 p-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        {[
                            "Choose a venue and open its menu",
                            "Add dishes to your cart",
                            "Place your order — staff get notified instantly",
                        ].map((step, i) => (
                            <li key={step} className="flex items-start gap-3">
                                <span className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                    {i + 1}
                                </span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </header>

                {/* 店舗一覧 */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Venues</h2>
                        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            {stores.length} venues
                        </span>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {stores.map((store) => (
                            <Link
                                key={store.slug}
                                href={`/menu/${store.slug}`}
                                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card transition hover:border-[var(--card-primary)] hover:shadow-xl"
                                style={getCardStyle(store)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--card-secondary)] via-white/20 to-[var(--card-accent)] opacity-60 transition group-hover:opacity-90" />
                                <div className="relative flex h-full min-h-[220px] flex-col justify-between p-7">
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
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {store.categories.map((cat) => (
                                                <span
                                                    key={cat.id}
                                                    className="rounded-full border border-border/60 bg-white/60 px-2.5 py-0.5 text-xs font-medium text-foreground/70"
                                                >
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 text-sm font-semibold text-[var(--card-primary)]">
                                        <span>Open live menu</span>
                                        <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* QRコードセクション */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">QR Codes</h2>
                        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            Scan with your phone
                        </span>
                    </div>
                    {hostOverride && (
                        <p className="rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">
                            QR target: <span className="font-mono font-semibold text-foreground">http://{hostOverride}</span>
                        </p>
                    )}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {stores.map((store) => (
                            <QrCodeCard
                                key={store.slug}
                                slug={store.slug}
                                displayName={store.displayName}
                                primary={store.theme.primary}
                                baseUrl={baseUrl ?? undefined}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
