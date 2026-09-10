-- Jharkhand Innovation Connect - Phase 1 database foundation
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;
create extension if not exists vector;

create type public.user_role as enum ('citizen','university','student','faculty','industry','government');
create type public.challenge_status as enum ('Submitted','Under Review','Validated','University Assigned','Research Started','Prototype','Pilot','Implemented');
create type public.priority_level as enum ('Low','Medium','High','Critical');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'citizen',
  organization text,
  phone text,
  district text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  title text not null,
  description text not null,
  current_situation text,
  desired_outcome text,
  domain text,
  district text not null,
  block text,
  village text,
  latitude double precision,
  longitude double precision,
  priority public.priority_level not null default 'Medium',
  status public.challenge_status not null default 'Submitted',
  affected_population integer not null default 0 check (affected_population >= 0),
  submitted_by uuid not null references public.profiles(id),
  submitted_date timestamptz not null default now(),
  tags text[] not null default '{}',
  image text,
  assigned_university text,
  match_score numeric(5,2),
  ai_analysis jsonb,
  ai_embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists challenges_status_idx on public.challenges(status);
create index if not exists challenges_district_idx on public.challenges(district);
create index if not exists challenges_submitted_by_idx on public.challenges(submitted_by);
create index if not exists challenges_embedding_idx on public.challenges using hnsw (ai_embedding vector_cosine_ops);

create table if not exists public.challenge_evidence (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text not null,
  departments text[] not null default '{}',
  expertise text[] not null default '{}',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id),
  university_id uuid references public.universities(id),
  title text not null,
  status text not null default 'Research Started',
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.industry_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  technology_area text,
  support text[] not null default '{}',
  district text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.collaborations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  industry_id uuid not null references public.industry_partners(id),
  support_type text not null,
  notes text,
  status text not null default 'Proposed',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  metric_name text not null,
  before_value numeric,
  after_value numeric,
  unit text,
  measured_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Keep profile records synchronized with Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, organization)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'Citizen'), '@', 1)),
    'citizen',
    new.raw_user_meta_data->>'organization'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    organization = coalesce(excluded.organization, public.profiles.organization),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_evidence enable row level security;
alter table public.universities enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.industry_partners enable row level security;
alter table public.collaborations enable row level security;
alter table public.notifications enable row level security;
alter table public.impact_metrics enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users can read public profile information and update only themselves.
create policy profiles_select_authenticated on public.profiles for select to authenticated using (true);
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Challenges: authenticated users can browse; submitters can create/update their own submissions.
create policy challenges_select_authenticated on public.challenges for select to authenticated using (true);
create policy challenges_insert_self on public.challenges for insert to authenticated with check (submitted_by = auth.uid());
create policy challenges_update_owner on public.challenges for update to authenticated using (submitted_by = auth.uid()) with check (submitted_by = auth.uid());

create policy evidence_select_authenticated on public.challenge_evidence for select to authenticated using (true);
create policy evidence_insert_self on public.challenge_evidence for insert to authenticated with check (uploaded_by = auth.uid());

create policy universities_select_authenticated on public.universities for select to authenticated using (true);
create policy projects_select_authenticated on public.projects for select to authenticated using (true);
create policy project_members_select_authenticated on public.project_members for select to authenticated using (true);
create policy industry_select_authenticated on public.industry_partners for select to authenticated using (true);
create policy collaborations_select_authenticated on public.collaborations for select to authenticated using (true);
create policy notifications_select_self on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_self on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy impact_select_authenticated on public.impact_metrics for select to authenticated using (true);
create policy audit_insert_authenticated on public.audit_logs for insert to authenticated with check (actor_id = auth.uid());

-- Storage bucket for challenge evidence. The bucket itself can be created from the Storage UI.
-- Recommended bucket name: challenge-evidence, private.
