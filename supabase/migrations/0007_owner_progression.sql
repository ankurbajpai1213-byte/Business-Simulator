-- Applied to production as 20260823_owner_progression.
--
-- Progression belongs to the owner, not to any one cafe. It survives a business
-- closing, a bankruptcy, or a fresh start. Rank and unlocks are never taken away;
-- standing moves both ways.

alter table public.players
  add column if not exists owner_reputation numeric not null default 30,
  add column if not exists rank text not null default 'founder',
  add column if not exists runs_started int not null default 0,
  add column if not exists runs_completed int not null default 0,
  add column if not exists best_profit numeric not null default 0,
  add column if not exists best_day int not null default 0,
  add column if not exists auth_user_id uuid;

alter table public.players drop constraint if exists players_rank_check;
alter table public.players add constraint players_rank_check
  check (rank in ('founder','operator','manager','multi','portfolio'));

create unique index if not exists players_auth_user_id_idx
  on public.players(auth_user_id) where auth_user_id is not null;

-- Feedback about the game itself, distinct from the in-run questionnaire.
create table if not exists public.game_feedback (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  session_id uuid references public.game_sessions(id) on delete set null,
  rating int check (rating between 1 and 5),
  message text not null check (char_length(trim(message)) between 1 and 4000),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.game_feedback enable row level security;
revoke all on public.game_feedback from anon, authenticated;
create index if not exists game_feedback_created_at_idx on public.game_feedback(created_at desc);
