-- ================================================================
-- Abundance Transmission — Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New query
-- ================================================================

-- ── Profiles table (extends auth.users) ──────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  role        text not null default 'member' check (role in ('admin', 'member')),
  full_name   text,
  created_at  timestamptz default now()
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'member'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Content table (newsletters + music) ──────────────────────────
create table if not exists public.content (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('newsletter', 'music')),
  title         text not null,
  description   text,
  file_url      text,        -- Supabase Storage URL for PDFs
  external_url  text,        -- Suno URL for music
  published     boolean not null default true,
  created_by    uuid references auth.users,
  created_at    timestamptz default now()
);

-- ── Downloads tracking ────────────────────────────────────────────
create table if not exists public.downloads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  content_id    uuid references public.content on delete cascade not null,
  downloaded_at timestamptz default now(),
  unique (user_id, content_id)
);

-- ── Row Level Security ────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.content   enable row level security;
alter table public.downloads enable row level security;

-- profiles: users see their own; admins see all
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update all profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- content: authenticated users read published; admins manage all
create policy "Members can read published content" on public.content
  for select to authenticated using (published = true);

create policy "Admins can manage content" on public.content
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- downloads: users manage their own; admins read all
create policy "Users can manage own downloads" on public.downloads
  for all using (auth.uid() = user_id);

create policy "Admins can read all downloads" on public.downloads
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ── Storage bucket for newsletter PDFs ───────────────────────────
insert into storage.buckets (id, name, public)
values ('newsletters', 'newsletters', false)
on conflict (id) do nothing;

create policy "Admins can upload newsletters" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'newsletters' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Members can download newsletters" on storage.objects
  for select to authenticated using (bucket_id = 'newsletters');

create policy "Admins can delete newsletters" on storage.objects
  for delete to authenticated using (
    bucket_id = 'newsletters' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
