import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { deterministicUuid } from "@/lib/utils";
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

type SupabaseCategoryJoin = {
  id: string;
  slug?: string | null;
  name?: string | null;
  sort_order?: number | null;
};

type SupabaseMenuRow = {
  id: string;
  store_slug: string;
  name: string | null;
  description?: string | null;
  price_cents?: number | null;
  currency?: string | null;
  image_path?: string | null;
  sort_order?: number | null;
  tags?: string[] | null;
  published?: boolean | null;
  category?: SupabaseCategoryJoin | SupabaseCategoryJoin[] | null;
};

const FALLBACK_CATEGORY = "Uncategorized";

function normaliseImagePath(
  pathValue: string | null | undefined,
): string | undefined {
  if (!pathValue) return undefined;
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return pathValue;
  }
  if (pathValue.startsWith("/")) {
    return pathValue;
  }
  return `/${pathValue}`;
}

export async function applySupabaseMenu(
  store: StoreConfig,
): Promise<StoreConfig> {
  const supabase = getClient();
  if (!supabase) {
    return store;
  }

  try {
    const originalItems = new Map<string, MenuItem>();
    const originalCategoriesBySlug = new Map<string, MenuCategory>();
    const originalCategoryOrder = new Map<string, number>();

    store.categories.forEach((category, index) => {
      const categoryUuid = deterministicUuid(`${store.slug}:category:${category.id}`);
      originalCategoriesBySlug.set(categoryUuid, category);
      originalCategoryOrder.set(categoryUuid, index);
      category.items.forEach((item) => {
        const itemUuid = deterministicUuid(`${store.slug}:item:${item.id}`);
        originalItems.set(itemUuid, item);
      });
    });

    const { data, error } = await supabase
      .from("menu_items")
      .select(
        `id, store_slug, name, description, price_cents, currency, image_path, sort_order, tags, published,
        category:menu_categories!inner(id, slug, name, sort_order)`,
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
    const categoryMap = new Map<
      string,
      { category: MenuCategory; sortOrder: number }
    >();

    for (const row of rows) {
      if (!row.id || !row.name) continue;

      const fallbackItem =
        originalItems.get(row.id) ??
        findItemByName(row.name, store.categories);

      const supabaseCategory = Array.isArray(row.category)
        ? row.category[0]
        : row.category;
      const fallbackCategory =
        (supabaseCategory?.slug
          ? originalCategoriesBySlug.get(deterministicUuid(`${store.slug}:category:${supabaseCategory.slug}`))
          : undefined) ??
        (fallbackItem
          ? findCategoryForItem(fallbackItem, store.categories)
          : undefined);

      const categoryName =
        supabaseCategory?.name?.trim() ||
        fallbackCategory?.name ||
        FALLBACK_CATEGORY;
      const categorySlug =
        supabaseCategory?.slug?.trim() ||
        fallbackCategory?.id ||
        slugify(categoryName);

      if (!categoryMap.has(categorySlug)) {
        categoryMap.set(categorySlug, {
          category: {
            id: categorySlug,
            name: categoryName,
            description: fallbackCategory?.description,
            items: [],
          },
          sortOrder:
            supabaseCategory?.sort_order ??
            (fallbackCategory
              ? (originalCategoryOrder.get(fallbackCategory.id) ?? 0)
              : Number.MAX_SAFE_INTEGER),
        });
      }

      const categoryEntry = categoryMap.get(categorySlug)!;
      const price =
        typeof row.price_cents === "number"
          ? row.price_cents / 100
          : (fallbackItem?.price ?? 0);

      const item: MenuItem = {
        id: row.id,
        name: row.name?.trim() || fallbackItem?.name || "Unnamed Item",
        description: row.description ?? fallbackItem?.description ?? undefined,
        price,
        currency: row.currency ?? fallbackItem?.currency ?? "AUD",
        tags: row.tags ?? fallbackItem?.tags ?? undefined,
        image: normaliseImagePath(row.image_path) ?? fallbackItem?.image,
        modelUrl: fallbackItem?.modelUrl,
        modelUrlUsdz: fallbackItem?.modelUrlUsdz,
      };

      categoryEntry.category.items.push(item);
      originalItems.delete(row.id);
    }

    // Add items that were not in Supabase but are in the JSON (fallback)
    for (const [uuid, fallbackItem] of originalItems.entries()) {
      const fallbackCategory = findCategoryForItem(fallbackItem, store.categories);
      if (!fallbackCategory) continue;

      const categoryUuid = deterministicUuid(`${store.slug}:category:${fallbackCategory.id}`);
      const categoryEntry = categoryMap.get(categoryUuid);

      if (categoryEntry) {
        categoryEntry.category.items.push(fallbackItem);
      } else {
        // If category not in map, create it
        categoryMap.set(categoryUuid, {
          category: { ...fallbackCategory, items: [fallbackItem] },
          sortOrder: originalCategoryOrder.get(categoryUuid) ?? 999
        });
      }
    }

    const categories = Array.from(categoryMap.values())
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ category }) => ({
        ...category,
        items: category.items.sort((a, b) =>
          a.name.localeCompare(b.name, "en"),
        ),
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function findCategoryForItem(
  item: MenuItem | undefined,
  categories: MenuCategory[],
): MenuCategory | undefined {
  if (!item) return undefined;
  for (const category of categories) {
    if (category.items.some((categoryItem) => categoryItem.id === item.id || categoryItem.name === item.name)) {
      return category;
    }
  }
  return undefined;
}

function findItemByName(
  name: string,
  categories: MenuCategory[],
): MenuItem | undefined {
  const normalizedSearchName = name.trim().toLowerCase();
  for (const category of categories) {
    const item = category.items.find(
      (i) => i.name.trim().toLowerCase() === normalizedSearchName,
    );
    if (item) return item;
  }
  return undefined;
}
