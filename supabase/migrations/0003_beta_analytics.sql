create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.game_sessions add column if not exists player_id uuid references public.players(id) on delete set null;

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  session_id uuid references public.game_sessions(id) on delete set null,
  day integer not null,
  ease text,
  gameplay text,
  realism text,
  decisions text,
  continue_playing text,
  comment text,
  skipped boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists game_sessions_player_id_idx on public.game_sessions(player_id);
create index if not exists beta_feedback_player_day_idx on public.beta_feedback(player_id, day);

alter table public.players enable row level security;
alter table public.beta_feedback enable row level security;

grant select, insert, update on table public.players to service_role;
grant select, insert on table public.beta_feedback to service_role;
