import Link from "next/link";

import type { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MenuNavProps {
  categories: MenuCategory[];
  activeCategory?: string;
}

export function MenuNav({ categories, activeCategory }: MenuNavProps) {
  return (
    <nav className="sticky top-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-6 py-4">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <Link
              key={category.id}
              href={`#${category.id}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:border-primary/60 hover:text-primary"
              )}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
