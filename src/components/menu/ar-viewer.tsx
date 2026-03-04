"use client";

import { useEffect, useRef } from "react";

interface ArViewerProps {
    modelUrl: string;
    modelUrlUsdz?: string;
    itemName: string;
    onClose: () => void;
}

/**
 * AR / 3D Viewer component.
 * - iOS Safari: Launches QuickLook (USDZ) via a dynamic rel="ar" anchor click.
 * - Android / PC: Renders an inline <model-viewer> 3D viewer.
 *   (On ARCore-supported Android devices the in-viewer AR button is available; otherwise 3D preview only.)
 */
export function ArViewer({
    modelUrl,
    modelUrlUsdz,
    itemName,
    onClose,
}: ArViewerProps) {
    const launched = useRef(false);

    // On iOS, attempt to launch AR immediately on first mount
    useEffect(() => {
        if (launched.current) return;
        launched.current = true;

        const ua = navigator.userAgent;
        const isIos =
            /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream: unknown }).MSStream;

        if (isIos && modelUrlUsdz) {
            // iOS Quick Look: create a dynamic <a rel="ar"> element and trigger a click
            const a = document.createElement("a");
            a.rel = "ar";
            a.href = modelUrlUsdz;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Close the modal since the OS takes over for Quick Look
            onClose();
            return;
        }

        // For non-iOS (including Android), fall through to render the model-viewer JSX below
    }, [modelUrl, modelUrlUsdz, itemName, onClose]);

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIos =
        /iPad|iPhone|iPod/.test(ua) &&
        !(typeof window !== "undefined" && (window as unknown as { MSStream: unknown }).MSStream);

    // iOS delegates to the OS via useEffect, so nothing to render
    if (isIos && modelUrlUsdz) return null;

    // Android / PC: inline display via model-viewer
    return (
        <div
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-black/80 px-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="relative w-full max-w-xl rounded-3xl bg-background shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`3D model of ${itemName}`}
            >
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                            3D Preview
                        </p>
                        <h2 className="text-lg font-semibold text-foreground">{itemName}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                        Close
                    </button>
                </div>

                {/* model-viewer web component */}
                <ModelViewerElement src={modelUrl} alt={itemName} />

                <div className="px-6 py-4 bg-secondary/30">
                    <p className="text-center text-[10px] leading-tight text-muted-foreground uppercase tracking-wider">
                        On Android, tap the button in the bottom-right corner to launch AR.<br />
                        (3D preview only on devices without AR support.)
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Wrapper for the model-viewer Web Component. */
function ModelViewerElement({ src, alt }: { src: string; alt: string }) {
    useEffect(() => {
        if (document.querySelector('script[data-mv]')) return;
        const script = document.createElement("script");
        script.type = "module";
        script.src =
            "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
        script.dataset.mv = "1";
        document.head.appendChild(script);
    }, []);

    return (
        <model-viewer
            src={src}
            alt={alt}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            touch-action="pan-y"
            shadow-intensity="1"
            style={{ width: "100%", height: "400px", background: "transparent" }}
        >
            <button slot="ar-button" className="absolute bottom-4 right-4 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg">
                View in your space (AR)
            </button>
        </model-viewer>
    );
}
