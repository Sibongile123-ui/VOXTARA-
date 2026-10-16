-- VOXTARA starter database schema for Supabase.
-- Read README.md before running. This is a starting point, not a complete anti-abuse system.

create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 28),
  topic text not null check (topic in ('Business','Relationships','Faith','Entertainment','Everyday life','Other')),
  title text not null check (char_length(title) between 5 and 100),
  body text not null check (char_length(body) between 10 and 1500),
  created_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published','hidden','pending'))
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 28),
  body text not null check (char_length(body) between 2 and 800),
  created_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published','hidden','pending'))
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  comment_id uuid references public.comments(id) on delete set null,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','reviewed','actioned','dismissed'))
);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;

-- Public can read published posts and comments.
create policy "Anyone can read published posts"
on public.posts for select to anon, authenticated
using (status = 'published');

create policy "Anyone can read published comments"
on public.comments for select to anon, authenticated
using (status = 'published');

-- Starter write policies permit anonymous posting. Add CAPTCHA, rate limiting,
-- and moderation/approval workflow before a public launch.
create policy "Anyone can create a post"
on public.posts for insert to anon, authenticated
with check (
  status = 'published'
  and char_length(nickname) between 2 and 28
  and char_length(title) between 5 and 100
  and char_length(body) between 10 and 1500
);

create policy "Anyone can create a comment"
on public.comments for insert to anon, authenticated
with check (
  status = 'published'
  and char_length(nickname) between 2 and 28
  and char_length(body) between 2 and 800
  and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
);

-- Reporting is intentionally not publicly readable.
create policy "Anyone can submit a report"
on public.reports for insert to anon, authenticated
with check (char_length(reason) between 3 and 500);

-- Do not create public update/delete policies. Configure a separate trusted
-- admin workflow for moderation, and never put a service-role key in browser code.
