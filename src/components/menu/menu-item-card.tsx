import Image from "next/image";

import type { MenuItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
  onSelect?: (item: MenuItem) => void;
}

export function MenuItemCard({
  item,
  className,
  onSelect,
}: MenuItemCardProps) {
  return (
    <button
      className={cn(
        "group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 text-left shadow-sm transition hover:border-primary/70 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary/30",
        className
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
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            {item.name}
          </h3>
        </div>
        {item.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
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
      </div>
      <div className="flex flex-col items-end gap-3">
        <p className="text-base font-semibold text-primary">
          {formatCurrency(item.price, item.currency ?? "AUD")}
        </p>
        <div className="relative aspect-square h-24 w-24 overflow-hidden rounded-xl bg-secondary">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="96px"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground">
              Image TBD
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
