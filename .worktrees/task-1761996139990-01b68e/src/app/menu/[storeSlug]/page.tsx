import { notFound } from "next/navigation";

import { MenuScreen } from "@/components/menu";
import { getStoreConfig, listStores } from "@/lib/getStoreConfig";
import type { MenuCategory, StoreConfig } from "@/lib/types";

interface MenuPageProps {
  params: { storeSlug: string };
}

export async function generateStaticParams() {
  const slugs = await listStores();
  return slugs.map((slug) => ({ storeSlug: slug }));
}

export async function generateMetadata({ params }: MenuPageProps) {
  const { storeSlug } = await params;
  try {
    const store = await getStoreConfig(storeSlug);
    return {
      title: `${store.displayName} Menu | Foovii`,
      description: `${store.displayName} ordering experience powered by Foovii`,
    };
  } catch {
    return {
      title: "Menu",
    };
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { storeSlug } = await params;

  const store = await getStoreConfig(storeSlug).catch(() => null);
  if (!store) {
    notFound();
  }

  const categories = withAnchors(store.categories);

  return <MenuScreen store={store} categories={categories} />;
}

function withAnchors(categories: StoreConfig["categories"]): MenuCategory[] {
  return categories.map((category) => ({
    ...category,
    id: category.id || slugify(category.name),
  }));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
