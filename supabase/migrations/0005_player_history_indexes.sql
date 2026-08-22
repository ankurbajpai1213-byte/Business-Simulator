-- Applied to production as 20260822142937_player_history_indexes.
-- Speeds up the admin player-history dashboard, which reads
-- players -> game_sessions -> game_events for one player at a time.

create index if not exists game_events_session_created_at_idx
  on public.game_events(session_id, created_at desc);

create index if not exists game_sessions_player_updated_at_idx
  on public.game_sessions(player_id, updated_at desc);

create index if not exists players_last_seen_at_idx
  on public.players(last_seen_at desc);

create index if not exists beta_feedback_player_created_at_idx
  on public.beta_feedback(player_id, created_at desc);
