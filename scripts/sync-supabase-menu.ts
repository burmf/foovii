import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import mime from "mime";

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
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "menu-assets";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script."
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const slugArg = args.find((arg) => !arg.startsWith("--"));
const storeSlug = slugArg ?? "dodam";
const shouldUploadAssets = args.includes("--upload-assets");

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

  const itemsPayload = await buildItemsPayload({
    store,
    categoryIdBySlug,
    supabase,
    uploadAssets: shouldUploadAssets,
  });

  const { error: itemsError, count: itemCount } = await supabase
    .from("menu_items")
    .upsert(itemsPayload, { onConflict: "id" , count: "exact" });

  if (itemsError) {
    throw itemsError;
  }

  console.log(
    `Synced ${categoriesPayload.length} categories and ${itemCount ?? itemsPayload.length} menu items for store "${store.slug}".`
  );
  if (shouldUploadAssets) {
    console.log(`Assets uploaded to bucket "${STORAGE_BUCKET}".`);
  }
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

async function buildItemsPayload(params: {
  store: StoreFile;
  categoryIdBySlug: Map<string, string>;
  supabase: ReturnType<typeof createClient>;
  uploadAssets: boolean;
}): Promise<UpsertItem[]> {
  const { store, categoryIdBySlug, supabase, uploadAssets } = params;
  const payload: UpsertItem[] = [];
  const assetCache = new Map<string, string>();

  if (uploadAssets) {
    await ensureBucket(supabase, STORAGE_BUCKET);
  }

  for (const category of store.categories) {
    const categoryId =
      categoryIdBySlug.get(category.id) ??
      deterministicUuid(`${store.slug}:category:${category.id}`);

    for (const [itemIndex, item] of category.items.entries()) {
      const imagePath = item.image
        ? await prepareAssetPath({
            itemImagePath: item.image,
            storeSlug: store.slug,
            supabase,
            uploadAssets,
            cache: assetCache,
          })
        : null;

      payload.push({
        id: deterministicUuid(`${store.slug}:item:${item.id}`),
        store_slug: store.slug,
        category_id: categoryId,
        name: item.name,
        description: item.description ?? null,
        price_cents: normalisePrice(item.price),
        currency: item.currency ?? "AUD",
        image_path: imagePath,
        tags: item.tags ?? null,
        sort_order: itemIndex,
        published: true,
      });
    }
  }

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

async function ensureBucket(
  supabase: ReturnType<typeof createClient>,
  bucketName: string
) {
  const { data: bucketList, error } = await supabase.storage.listBuckets();
  if (error) {
    throw error;
  }

  const exists = bucketList?.some((bucket) => bucket.name === bucketName);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: "50mb",
    });
    if (createError) {
      throw createError;
    }
    console.log(`Created storage bucket "${bucketName}".`);
  }
}

async function prepareAssetPath(params: {
  itemImagePath: string;
  storeSlug: string;
  supabase: ReturnType<typeof createClient>;
  uploadAssets: boolean;
  cache: Map<string, string>;
}): Promise<string> {
  const { itemImagePath, storeSlug, supabase, uploadAssets, cache } = params;
  const normalised = normaliseImagePath(itemImagePath);

  if (!normalised) {
    return itemImagePath;
  }

  if (!uploadAssets) {
    return normalised;
  }

  if (cache.has(normalised)) {
    return cache.get(normalised)!;
  }

  const relativePath = normalised.replace(/^\//, "");
  const absolutePath = path.join(process.cwd(), relativePath.startsWith("public/") ? relativePath : path.join("public", relativePath));
  const fileBuffer = await fs.readFile(absolutePath);
  const contentType = mime.getType(absolutePath) ?? "application/octet-stream";

  const targetPath = `${storeSlug}/${path.basename(relativePath)}`;
  const storage = supabase.storage.from(STORAGE_BUCKET);
  const { error: uploadError } = await storage.upload(targetPath, fileBuffer, {
    contentType,
    upsert: true,
  });

  if (uploadError && uploadError.message && !uploadError.message.includes("Duplicate")) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = storage.getPublicUrl(targetPath);

  cache.set(normalised, publicUrl);
  return publicUrl;
}

function normaliseImagePath(pathValue: string | null | undefined): string | null {
  if (!pathValue) return null;
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return pathValue;
  }
  if (pathValue.startsWith("/")) {
    return pathValue;
  }
  return `/${pathValue}`;
}

main().catch((error) => {
  console.error("Failed to sync Supabase menu:", error);
  process.exit(1);
});
