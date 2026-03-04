import Image from "next/image";

import type { MenuItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
  onSelect?: (item: MenuItem) => void;
}

export function MenuItemCard({ item, className, onSelect }: MenuItemCardProps) {
  return (
    <button
      className={cn(
        "group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 text-left shadow-sm transition hover:border-primary/60 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary/30",
        className,
      )}
      onClick={() => onSelect?.(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(item);
        }
      }}
      type="button"
      aria-label={`View ${item.name}`}
    >
      {/* Left column: text content */}
      <div className="flex flex-col gap-2 py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {item.name}
          </h3>
          {item.modelUrl ? (
            <span className="shrink-0 rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              3D
            </span>
          ) : null}
        </div>
        {item.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        ) : null}
        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {/* Price */}
        <p className="mt-auto pt-1 text-base font-bold text-primary">
          {formatCurrency(item.price, item.currency ?? "AUD")}
        </p>
      </div>

      {/* Right column: image + quick-add button */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="relative aspect-square h-24 w-24 overflow-hidden rounded-xl bg-secondary">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="96px"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl opacity-30">
              🍽️
            </div>
          )}
        </div>
        {/* Quick-add button */}
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-base font-semibold text-muted-foreground shadow-sm transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
        >
          +
        </span>
      </div>
    </button>
  );
}
