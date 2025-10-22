import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

type StoreFile = {
  slug: string;
  displayName: string;
  categories: Array<{
    id: string;
    name: string;
    description?: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      currency?: string;
      tags?: string[];
      image?: string;
    }>;
  }>;
};

type UpsertCategory = {
  id: string;
  store_slug: string;
  slug: string;
  name: string;
  sort_order: number;
  description?: string | null;
  published: boolean;
};

type UpsertItem = {
  id: string;
  store_slug: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_path: string | null;
  tags: string[] | null;
  sort_order: number;
  published: boolean;
};

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
  process.exit(1);
}

const [, , inputSlug] = process.argv;
const storeSlug = inputSlug ?? "dodam";

async function main() {
  const store = await loadStore(storeSlug);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const categoriesPayload = buildCategoriesPayload(store);

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("menu_categories")
    .upsert(categoriesPayload, { onConflict: "id" })
    .select("id, slug");

  if (categoriesError) {
    throw categoriesError;
  }

  const categoryIdBySlug = new Map<string, string>();
  categoriesData?.forEach((category) => {
    categoryIdBySlug.set(category.slug, category.id);
  });

  const itemsPayload = buildItemsPayload(store, categoryIdBySlug);

  const { error: itemsError, count: itemCount } = await supabase
    .from("menu_items")
    .upsert(itemsPayload, { onConflict: "id" , count: "exact" });

  if (itemsError) {
    throw itemsError;
  }

  console.log(`Synced ${categoriesPayload.length} categories and ${itemCount ?? itemsPayload.length} menu items for store "${store.slug}".`);
}

async function loadStore(slug: string): Promise<StoreFile> {
  const storePath = path.join(process.cwd(), "stores", `${slug}.json`);
  const raw = await fs.readFile(storePath, "utf-8");
  return JSON.parse(raw) as StoreFile;
}

function buildCategoriesPayload(store: StoreFile): UpsertCategory[] {
  return store.categories.map((category, index) => ({
    id: deterministicUuid(`${store.slug}:category:${category.id}`),
    store_slug: store.slug,
    slug: category.id,
    name: category.name,
    sort_order: index,
    description: category.description ?? null,
    published: true,
  }));
}

function buildItemsPayload(store: StoreFile, categoryIdBySlug: Map<string, string>): UpsertItem[] {
  const payload: UpsertItem[] = [];

  store.categories.forEach((category) => {
    const categoryId = categoryIdBySlug.get(category.id) ?? deterministicUuid(`${store.slug}:category:${category.id}`);

    category.items.forEach((item, itemIndex) => {
      payload.push({
        id: deterministicUuid(`${store.slug}:item:${item.id}`),
        store_slug: store.slug,
        category_id: categoryId,
        name: item.name,
        description: item.description ?? null,
        price_cents: normalisePrice(item.price),
        currency: item.currency ?? "AUD",
        image_path: item.image ?? null,
        tags: item.tags ?? null,
        sort_order: itemIndex,
        published: true,
      });
    });
  });

  return payload;
}

function deterministicUuid(seed: string): string {
  const hash = createHash("sha1").update(seed).digest();
  const bytes = Buffer.from(hash.slice(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // Version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function normalisePrice(price: number): number {
  if (!Number.isFinite(price)) {
    return 0;
  }
  return Math.round(price * 100);
}

main().catch((error) => {
  console.error("Failed to sync Supabase menu:", error);
  process.exit(1);
});
