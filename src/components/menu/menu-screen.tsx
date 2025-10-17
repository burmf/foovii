"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import type { MenuCategory, MenuItem, StoreConfig } from "@/lib/types";

import { CartBar } from "./cart-bar";
import { CartProvider, useCart } from "./cart-context";
import { CartButton } from "./cart-button";
import { CartSheet } from "./cart-sheet";
import { MenuHeader } from "./menu-header";
import { MenuItemModal } from "./menu-item-modal";
import { MenuNav } from "./menu-nav";
import { MenuSection } from "./menu-section";

interface MenuScreenProps {
  store: StoreConfig;
  categories: MenuCategory[];
}

export function MenuScreen({ store, categories }: MenuScreenProps) {
  const themedStyle = useMemo((): CSSProperties => {
    const theme = store.theme;
    return {
      "--primary": theme.primary,
      "--primary-foreground": "#ffffff",
      "--secondary": theme.secondary,
      "--accent": theme.accent,
      "--background": theme.background,
      "--card": theme.background,
      "--popover": theme.background,
      "--theme-color": theme.primary,
      "--sidebar": theme.background,
      "--sidebar-primary": theme.primary,
    } as CSSProperties;
  }, [store.theme]);

  return (
    <CartProvider>
      <MenuView store={store} categories={categories} style={themedStyle} />
    </CartProvider>
  );
}

function MenuView({
  store,
  categories,
  style,
}: MenuScreenProps & { style: CSSProperties }) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? ""
  );
  const { addItem } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveCategory(visible[0].target.id);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.25, 0.5, 0.75],
      }
    );

    const sections = categories
      .map((category) => document.getElementById(category.id))
      .filter((section): section is Element => Boolean(section));

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [categories]);

  return (
    <div className="min-h-screen bg-background text-foreground" style={style}>
      <aside className="border-b border-border/70 bg-secondary/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3 text-xs text-muted-foreground">
          <span>Dining at {store.address}</span>
          <span className="rounded-full border border-border px-3 py-1 font-semibold uppercase tracking-[0.25em] text-primary">
            Order Now
          </span>
        </div>
      </aside>
      <MenuNav categories={categories} activeCategory={activeCategory} />
      <div className="mx-auto w-full max-w-5xl px-6 pb-32 pt-8">
        <MenuHeader store={store} />
        <div className="grid gap-12">
          {categories.map((category) => (
            <MenuSection
              key={category.id}
              category={category}
              onSelectItem={(item) => setSelectedItem(item)}
            />
          ))}
        </div>
      </div>
      <CartBar
        onReview={() => setReviewOpen(true)}
        isReviewOpen={reviewOpen}
      />
      <CartButton
        onClick={() => setReviewOpen(true)}
        isOpen={reviewOpen}
      />
      {selectedItem ? (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, quantity, notes) => addItem(item, quantity, notes)}
        />
      ) : null}
      <CartSheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        store={store}
      />
    </div>
  );
}
