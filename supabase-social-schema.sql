-- ============================================================
-- Dashboard UPM — Schema Analitik Medsos & Komentar Publik
-- Run this in your Supabase SQL Editor if you want to store in Supabase
-- ============================================================

-- 1. Tabel Metrik Pertumbuhan Akun
create table if not exists public.social_metrics (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'youtube', 'tiktok')),
  followers integer not null default 0,
  followers_formatted text,
  following integer default 0,
  posts_count integer default 0,
  monthly_growth text,
  top_peak_views text,
  top_peak_title text,
  recorded_at timestamptz default now()
);

-- 2. Tabel Komentar Masuk & Rekomendasi Respon AI
create table if not exists public.social_comments (
  id text primary key,
  platform text not null check (platform in ('instagram', 'youtube', 'tiktok')),
  author_name text not null,
  author_handle text,
  comment_text text not null,
  post_title text,
  post_url text,
  category text not null check (category in ('madrasah', 'umum', 'apresiasi')),
  is_important boolean default false,
  status text not null default 'perlu_respon' check (status in ('perlu_respon', 'selesai')),
  ai_draft_reply text,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.social_metrics enable row level security;
alter table public.social_comments enable row level security;

create policy "Allow read for all social" on public.social_metrics for select using (true);
create policy "Allow write for all social" on public.social_metrics for all using (true) with check (true);

create policy "Allow read for all comments" on public.social_comments for select using (true);
create policy "Allow write for all comments" on public.social_comments for all using (true) with check (true);
