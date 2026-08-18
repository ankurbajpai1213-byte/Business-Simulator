-- v0.1 authoritative game-session migration.
-- Run this through Supabase migrations before enabling the persistent game API.

alter table public.player_feedback
  add constraint player_feedback_session_id_fkey
  foreign key (session_id) references public.game_sessions(id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists game_sessions_set_updated_at on public.game_sessions;
create trigger game_sessions_set_updated_at
before update on public.game_sessions
for each row execute function public.set_updated_at();

-- The application uses the server-side service role for the anonymous prototype.
-- RLS remains enabled and no public write policies are created.
