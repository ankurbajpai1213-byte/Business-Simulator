-- v0.1 authoritative game-session migration.
-- 0001 already creates the feedback -> session foreign key.

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
