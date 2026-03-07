-- Supabase schema for Foovii menu management
-- Run these statements in the Supabase SQL editor or via the CLI.

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  store_slug text not null,
  slug text not null,
  name text not null,
  sort_order integer null,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists menu_categories_store_slug_slug_idx
  on public.menu_categories (store_slug, slug);

create index if not exists menu_categories_store_slug_order_idx
  on public.menu_categories (store_slug, coalesce(sort_order, 0), name);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  store_slug text not null,
  category_id uuid references public.menu_categories(id) on delete cascade,
  name text not null,
  description text null,
  price_cents integer not null,
  currency text not null default 'AUD',
  image_path text null,
  tags text[] null,
  sort_order integer null,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists menu_items_store_category_idx
  on public.menu_items (store_slug, category_id, coalesce(sort_order, 0), name);

create index if not exists menu_items_store_slug_idx
  on public.menu_items (store_slug);

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

DROP POLICY IF EXISTS "menu_categories_public_select" ON public.menu_categories;
CREATE POLICY "menu_categories_public_select" ON public.menu_categories
  FOR SELECT USING (published);

DROP POLICY IF EXISTS "menu_items_public_select" ON public.menu_items;
CREATE POLICY "menu_items_public_select" ON public.menu_items
  FOR SELECT USING (published);

-- Updated-at trigger
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists menu_categories_touch_updated_at on public.menu_categories;
create trigger menu_categories_touch_updated_at
  before update on public.menu_categories
  for each row
  execute function public.touch_updated_at();

drop trigger if exists menu_items_touch_updated_at on public.menu_items;
create trigger menu_items_touch_updated_at
  before update on public.menu_items
  for each row
  execute function public.touch_updated_at();
