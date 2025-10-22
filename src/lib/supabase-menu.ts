import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { MenuCategory, MenuItem, StoreConfig } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }

  return client;
}

type SupabaseMenuRow = {
  id: string;
  store_slug: string;
  name: string;
  description?: string | null;
  price_cents?: number | null;
  currency?: string | null;
  image_path?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  sort_order?: number | null;
  tags?: string[] | null;
  published?: boolean | null;
};

const FALLBACK_CATEGORY = "Uncategorized";

function normaliseImagePath(pathValue: string | null | undefined): string | undefined {
  if (!pathValue) return undefined;
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return pathValue;
  }
  if (pathValue.startsWith("/")) {
    return pathValue;
  }
  return `/${pathValue}`;
}

export async function applySupabaseMenu(store: StoreConfig): Promise<StoreConfig> {
  const supabase = getClient();
  if (!supabase) {
    return store;
  }

  try {
    const originalItems = new Map<string, MenuItem>();
    for (const category of store.categories) {
      for (const item of category.items) {
        originalItems.set(item.id, item);
      }
    }

    const { data, error } = await supabase
      .from("menu_items")
      .select(
        "id, store_slug, name, description, price_cents, currency, image_path, category_name, category_slug, sort_order, tags, published"
      )
      .eq("store_slug", store.slug)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase menu fetch error", error);
      return store;
    }

    if (!data || data.length === 0) {
      return store;
    }

    const rows = data as SupabaseMenuRow[];
    const categoryMap = new Map<string, MenuCategory>();

    for (const row of rows) {
      if (!row.name) continue;
      const categoryKey = row.category_name?.trim() || FALLBACK_CATEGORY;
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          id: row.category_slug || categoryKey.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: categoryKey,
          items: [],
        });
      }

      const category = categoryMap.get(categoryKey)!;
      const fallbackItem = originalItems.get(row.id);
      const price =
        typeof row.price_cents === "number"
          ? row.price_cents / 100
          : fallbackItem?.price ?? 0;

      const item: MenuItem = {
        id: row.id,
        name: row.name || fallbackItem?.name || "Unnamed Item",
        description: row.description ?? fallbackItem?.description ?? undefined,
        price,
        currency: row.currency ?? fallbackItem?.currency ?? "AUD",
        tags: row.tags ?? fallbackItem?.tags ?? undefined,
        image: normaliseImagePath(row.image_path) ?? fallbackItem?.image,
      };

      category.items.push(item);
    }

    const categories = Array.from(categoryMap.values()).map((category) => ({
      ...category,
      items: category.items.sort((a, b) => a.name.localeCompare(b.name, "en")),
    }));

    return {
      ...store,
      categories,
    };
  } catch (err) {
    console.error("Failed to apply Supabase menu", err);
    return store;
  }
}
