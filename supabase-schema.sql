-- ============================================================
-- Dashboard UPM — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Tasks table ──────────────────────────────────────────────
create table if not exists public.tasks (
  id              text primary key,
  name            text not null,
  kat             text not null,
  grade           text not null check (grade in ('S','A','B','C')),
  status          text not null check (status in ('planning','produksi','qc','selesai')),
  type            text not null check (type in ('tim','admin')),
  deadline        timestamptz not null,
  publish_date    timestamptz,
  assignee        text,
  file            text,
  file_drive_id   text,
  platform        text,
  durasi          text,
  skrip           text,
  konsep          text,
  qc_comment      text,
  bulan           integer not null check (bulan >= 0 and bulan <= 11),
  hijri_year      integer not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  created_by      text
);

-- ── Row Level Security ───────────────────────────────────────
alter table public.tasks enable row level security;

-- Allow all reads (auth handled at app level)
create policy "Allow read for all"
  on public.tasks for select
  using (true);

-- Allow insert/update/delete for authenticated-ish sessions
-- In production, replace with Supabase Auth checks
create policy "Allow write"
  on public.tasks for all
  using (true)
  with check (true);

-- ── Auto-update updated_at ───────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure update_updated_at_column();

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_tasks_bulan      on public.tasks(bulan);
create index if not exists idx_tasks_hijri_year on public.tasks(hijri_year);
create index if not exists idx_tasks_status     on public.tasks(status);
create index if not exists idx_tasks_type       on public.tasks(type);
create index if not exists idx_tasks_deadline   on public.tasks(deadline);

-- ── Sample data (optional, remove in production) ─────────────
insert into public.tasks (id, name, kat, grade, status, type, deadline, publish_date, assignee, file, platform, durasi, bulan, hijri_year)
values
  ('t1','Fiqih - Mensucikan Najis','Edukasi Fiqih','A','planning','tim', now() + interval '2 hours', now() + interval '5 days', 'Crew A', null,'Instagram','1 Menit', extract(month from now())::int - 1, 1447),
  ('t2','Podcast - Guru Bana Pert.','Podcast/Reels','S','produksi','tim', now() - interval '1 hour', now() + interval '3 days', 'Crew B', null,'YouTube','30 Menit', extract(month from now())::int - 1, 1447),
  ('t3','Desain Flyer Event Besar','Desain Flyer/Poster','B','qc','tim', now() + interval '24 hours', now() + interval '7 days', 'Crew C', 'flyer_v1.png','Instagram','4 Slide', extract(month from now())::int - 1, 1447),
  ('a1','Pengelolaan Anggaran Q4','Pengelolaan Anggaran','S','planning','admin', now() + interval '12 hours', null, null, null, null, null, extract(month from now())::int - 1, 1447),
  ('a2','Laporan Keuangan November','Laporan Keuangan','A','selesai','admin', now() + interval '36 hours', null, null, 'laporan.pdf', null, null, extract(month from now())::int - 1, 1447)
on conflict (id) do nothing;
