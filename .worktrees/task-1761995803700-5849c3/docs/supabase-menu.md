# Supabase Menu Integration

Foovii can source menu content and media from Supabase instead of the local JSON fixtures. Set up the following resources in your Supabase project (all tables should live in the `public` schema):

## Tables

### `menu_categories`
| Column          | Type        | Notes                                      |
|-----------------|-------------|--------------------------------------------|
| `id`            | uuid        | Primary key (default `gen_random_uuid()`). |
| `store_slug`    | text        | Foreign key to tenant (e.g. `dodam`).      |
| `slug`          | text        | URL-safe slug (`all-day-menu`).            |
| `name`          | text        | Display name.                              |
| `sort_order`    | int         | Ordering within a store (optional).        |
| `published`     | boolean     | Set to `true` to expose in API.            |
| `created_at`    | timestamptz | Default `now()`.                           |
| `updated_at`    | timestamptz | Default `now()`.                           |

Add a composite index on `(store_slug, sort_order)`.

### `menu_items`
| Column            | Type        | Notes                                                                          |
|-------------------|-------------|--------------------------------------------------------------------------------|
| `id`              | uuid        | Primary key.                                                                   |
| `store_slug`      | text        | Tenant slug (`dodam`).                                                         |
| `category_id`     | uuid        | FK → `menu_categories.id`.                                                     |
| `name`            | text        | Display name.                                                                  |
| `description`     | text        | HTML or Markdown.                                                              |
| `price_cents`     | integer     | Integer representation (e.g. `3600` for $36.00).                               |
| `currency`        | text        | ISO 4217 code (`AUD`).                                                         |
| `image_path`      | text        | Public URL or `/storage/v1/object/public/...` path from Supabase Storage.      |
| `tags`            | text[]      | Optional badges (nullable).                                                    |
| `sort_order`      | integer     | Ordering number within the category (nullable).                                |
| `published`       | boolean     | `true` to expose to the app.                                                   |
| `created_at`      | timestamptz | Default `now()`.                                                               |
| `updated_at`      | timestamptz | Default `now()`.                                                               |

Add an index on `(store_slug, category_id, sort_order)` and a partial index enforcing `published` items.

## Storage
- Create a public bucket, e.g. `menu-assets`.
- Upload product images to `menu-assets/<storeSlug>/<filename>.png` and mark them public.
- Store the public URL or storage path in `menu_items.image_path`.

## Seeding Data from Local JSON
- Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET` are configured (see `config/.env.example`).
- Run `pnpm install` once to ensure the `tsx` runner is available.
- Execute the sync script with the store slug (defaults to `dodam`):

  ```bash
  pnpm sync:supabase dodam
  ```

  The script reads `stores/<slug>.json`, deterministically generates UUIDs, and upserts data into `menu_categories` / `menu_items`.
- Add `--upload-assets` to push local images from `public/menu-images/<slug>` to Supabase Storage and automatically store their public URLs in `image_path`:

  ```bash
  pnpm sync:supabase dodam --upload-assets
  ```

  The bucket is created automatically if it does not exist; ensure the service role key has Storage permissions.
- Re-run the script whenever the local fixtures change to keep Supabase in sync.

## Row Level Security (RLS)
Enable RLS on both tables and add policies (examples):

```sql
create policy "Public read" on public.menu_categories
for select using (published);

create policy "Public read" on public.menu_items
for select using (published);
```

Use service-role keys for writes via automation scripts.

## Sync Script
The Node script (`scripts/sync-dodam-menu.ts`, TBD) should:
1. Fetch latest data from Square Online.
2. Upload/replace Storage objects if needed.
3. Upsert `menu_categories` and `menu_items` with the latest content.

## Environment
Set the following in `.env.local` (values live in the secret manager):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

For server-side scripts, also configure the service key:

```
SUPABASE_SERVICE_ROLE_KEY=...
```

(Keep service keys out of the frontend bundle.)

Once populated, Foovii will automatically pull Supabase data at build/runtime; local JSON is only used as a fallback.

## SQL Helper
`supabase/sql/menu-schema.sql` contains the full DDL (tables, indexes, RLS policies, updated-at trigger). Run it once in the Supabase SQL editor or via the CLI:

```bash
supabase db remote commit --file supabase/sql/menu-schema.sql
```

Adjust currency defaults or indexes as needed for additional tenants.
