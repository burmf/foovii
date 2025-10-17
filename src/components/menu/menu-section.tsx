import type { MenuCategory } from "@/lib/types";
import { MenuItemCard } from "@/components/menu/menu-item-card";

interface MenuSectionProps {
  category: MenuCategory;
  onSelectItem?: (item: MenuCategory["items"][number]) => void;
}

export function MenuSection({ category, onSelectItem }: MenuSectionProps) {
  return (
    <section id={category.id} className="scroll-mt-24 space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          {category.name}
        </p>
        {category.description ? (
          <p className="text-sm text-muted-foreground">{category.description}</p>
        ) : null}
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {category.items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </section>
  );
}
