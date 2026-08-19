-- Beta engine fixes from the Round 2 audit.
-- Adds the explicit 90-day survived-but-unprofitable terminal state.

alter table public.game_sessions
  drop constraint if exists game_sessions_status_check;

alter table public.game_sessions
  add constraint game_sessions_status_check
  check (status in ('active', 'won', 'completed', 'bankrupt', 'abandoned'));
