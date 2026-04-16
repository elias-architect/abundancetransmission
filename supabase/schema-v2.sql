-- ================================================================
-- Abundance Transmission — Schema v2
-- Run in Supabase → SQL Editor → New query
-- ================================================================

-- Add body_html to content (for written newsletters)
alter table public.content add column if not exists body_html text;
alter table public.content add column if not exists cover_url text;
alter table public.content add column if not exists video_url text;

-- Settings table (CC password, site config)
create table if not exists public.settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz default now()
);

-- Default Command Center password
insert into public.settings (key, value)
values ('cc_password', 'Enigma369!')
on conflict (key) do nothing;

-- Events table (analytics)
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade,
  type        text not null,  -- 'login' | 'download' | 'music_play' | 'page_view'
  content_id  uuid references public.content on delete set null,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- RLS
alter table public.settings enable row level security;
alter table public.events   enable row level security;

-- Settings: only admins can read/write
create policy "Admins can manage settings" on public.settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Allow service role to read settings (for CC password check in API)
create policy "Anyone can read settings" on public.settings
  for select using (true);

-- Events: users can insert their own; admins read all
create policy "Users can insert own events" on public.events
  for insert with check (auth.uid() = user_id);

create policy "Users can read own events" on public.events
  for select using (auth.uid() = user_id);

create policy "Admins can read all events" on public.events
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Music content is publicly readable (for homepage player)
create policy "Public can read published music" on public.content
  for select using (published = true and type = 'music');
