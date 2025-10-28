import Image from "next/image";

import type { StoreConfig } from "@/lib/types";

interface MenuHeaderProps {
  store: StoreConfig;
}

export function MenuHeader({ store }: MenuHeaderProps) {
  return (
    <header className="flex flex-col-reverse gap-6 pb-10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span>Foovii</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/60" aria-hidden />
          <span>QR Ordering</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {store.displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {store.address}
          </p>
        </div>
      </div>
      <div className="relative h-36 w-full overflow-hidden rounded-3xl bg-secondary sm:h-40 sm:w-72">
        {store.heroImage ? (
          <Image
            src={store.heroImage}
            alt={`${store.displayName} hero`}
            fill
            sizes="(max-width: 640px) 100vw, 288px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Hero image TBD
          </div>
        )}
      </div>
    </header>
  );
}
