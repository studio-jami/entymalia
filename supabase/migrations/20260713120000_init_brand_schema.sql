-- Entymalia — initial cloud schema
-- Mirrors the Android Room entities (BrandProfile, GeneratedAsset) for multi-client
-- sync (Android + web), owned per authenticated user with Row-Level Security.
--
-- Notes:
--  * UUID primary keys (not the Room autoincrement Long) so offline/multi-device
--    inserts never collide. The clients will adopt UUIDs when sync is wired.
--  * `content` holds SVG XML / Base64 image / video ref today (mirrors Room). Large
--    binaries should later move to Supabase Storage (bucket ENTYMALIA), with this
--    column holding a storage path/URL instead of Base64.

create extension if not exists pgcrypto;

-- updated_at helper -----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- brand_profiles --------------------------------------------------------------
create table if not exists public.brand_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name            text not null,
  industry        text not null default '',
  description     text not null default '',
  voice           text not null default '',
  primary_color   text not null default '#2D3748',
  secondary_color text not null default '#4A5568',
  accent_color    text not null default '#3B82F6',
  font_style      text not null default 'Modern Sans',
  keywords        text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists brand_profiles_user_id_idx
  on public.brand_profiles (user_id);

drop trigger if exists brand_profiles_set_updated_at on public.brand_profiles;
create trigger brand_profiles_set_updated_at
  before update on public.brand_profiles
  for each row execute function public.set_updated_at();

-- generated_assets ------------------------------------------------------------
create table if not exists public.generated_assets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  profile_id   uuid not null references public.brand_profiles (id) on delete cascade,
  asset_type   text not null,
  title        text not null default '',
  prompt       text not null default '',
  model_used   text not null default '',
  content      text not null,
  size         text not null default '1K',
  aspect_ratio text not null default '1:1',
  created_at   timestamptz not null default now()
);

create index if not exists generated_assets_user_id_idx
  on public.generated_assets (user_id);
create index if not exists generated_assets_profile_id_idx
  on public.generated_assets (profile_id);

-- Row-Level Security ----------------------------------------------------------
alter table public.brand_profiles   enable row level security;
alter table public.generated_assets enable row level security;

-- brand_profiles: owner-only CRUD
create policy "profiles_select_own"
  on public.brand_profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.brand_profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.brand_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_delete_own"
  on public.brand_profiles for delete
  using (auth.uid() = user_id);

-- generated_assets: owner-only CRUD; inserts must reference a profile you own
create policy "assets_select_own"
  on public.generated_assets for select
  using (auth.uid() = user_id);

create policy "assets_insert_own"
  on public.generated_assets for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.brand_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

create policy "assets_update_own"
  on public.generated_assets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assets_delete_own"
  on public.generated_assets for delete
  using (auth.uid() = user_id);

