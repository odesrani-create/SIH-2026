create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('challenge-evidence', 'challenge-evidence', false)
on conflict (id) do nothing;

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique,
  title text not null,
  description text not null,
  duration text not null default '',
  symptoms text not null default '',
  category text not null default '',
  affected_group text not null default '',
  population integer not null default 0 check (population >= 0),
  district text not null,
  block text not null default '',
  village text not null default '',
  gps text not null default '',
  outcome text not null default '',
  domain text not null,
  priority text not null,
  duplicate_risk text not null,
  submitted_by text not null default 'Community reporter',
  validation jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

drop policy if exists "Anyone can read challenges" on public.challenges;
create policy "Anyone can read challenges"
  on public.challenges for select
  using (true);

drop policy if exists "Anyone can submit challenges" on public.challenges;
create policy "Anyone can submit challenges"
  on public.challenges for insert
  with check (char_length(title) between 4 and 180 and char_length(description) >= 10);

create index if not exists challenges_domain_district_idx on public.challenges (domain, district);
create index if not exists challenges_tracking_id_idx on public.challenges (tracking_id);

drop policy if exists "Anyone can upload challenge evidence" on storage.objects;
create policy "Anyone can upload challenge evidence"
  on storage.objects for insert
  with check (bucket_id = 'challenge-evidence');