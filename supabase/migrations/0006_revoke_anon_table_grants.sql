-- Applied to production as 20260822153512_revoke_anon_table_grants.
--
-- Defence in depth.
--
-- Every table already had RLS enabled with no policies, so anonymous clients were
-- blocked. But `anon` and `authenticated` still held full table privileges, which
-- meant a single permissive policy added later would have exposed everything.
--
-- The application never uses these roles: all database access goes through the
-- server using the service role. Removing the grants means the security of this
-- data no longer rests on RLS alone.

revoke all on public.players from anon, authenticated;
revoke all on public.game_sessions from anon, authenticated;
revoke all on public.game_events from anon, authenticated;
revoke all on public.player_feedback from anon, authenticated;
revoke all on public.beta_feedback from anon, authenticated;

-- Future tables in this schema should not hand these roles anything either.
alter default privileges in schema public revoke all on tables from anon, authenticated;
