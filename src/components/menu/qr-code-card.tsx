"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface QrCodeCardProps {
    slug: string;
    displayName: string;
    primary: string;
    baseUrl?: string;
}

export function QrCodeCard({ slug, displayName, primary, baseUrl }: QrCodeCardProps) {
    const [url, setUrl] = useState("");

    useEffect(() => {
        setUrl(`${baseUrl ?? window.location.origin}/menu/${slug}`);
    }, [slug, baseUrl]);

    return (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                {displayName}
            </p>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
                {url ? (
                    <QRCodeSVG
                        value={url}
                        size={160}
                        fgColor={primary}
                        bgColor="#ffffff"
                        level="M"
                    />
                ) : (
                    <div className="h-40 w-40 animate-pulse rounded-xl bg-secondary" />
                )}
            </div>
            <p className="text-center text-xs text-muted-foreground break-all">
                {url || "読み込み中…"}
            </p>
        </div>
    );
}
