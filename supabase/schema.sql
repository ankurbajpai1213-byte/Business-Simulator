create extension if not exists pgcrypto;

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  city text not null default 'mumbai',
  business_type text not null default 'cafe',
  state jsonb not null,
  status text not null default 'active' check (status in ('active', 'won', 'bankrupt', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  day integer not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.player_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  rating integer not null check (rating between 1 and 5),
  replay boolean,
  realism integer check (realism between 1 and 5),
  difficulty integer check (difficulty between 1 and 5),
  comment text,
  session_days integer,
  created_at timestamptz not null default now()
);

create index if not exists game_events_session_day_idx on public.game_events(session_id, day);
create index if not exists player_feedback_created_at_idx on public.player_feedback(created_at desc);

alter table public.game_sessions enable row level security;
alter table public.game_events enable row level security;
alter table public.player_feedback enable row level security;

-- Public prototype feedback is inserted through the server-side API using the service role.
-- User/session ownership policies will be added with Supabase Auth before public testing.
