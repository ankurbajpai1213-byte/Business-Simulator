import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Admin player history.
 *
 * GET /api/admin/players                  -> list of players, newest activity first
 * GET /api/admin/players?playerId=<uuid>  -> one player's sessions, events and feedback
 *
 * Every query is scoped to a single player. Nothing global is ever fetched, so the
 * dashboard neither slows down nor starts truncating as more people play.
 */

const EVENT_PAGE = 400;

function authorised(request: Request): boolean {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  // Without a configured token the dashboard stays shut rather than open.
  if (!expected || expected.length < 8) return false;
  const provided = request.headers.get("x-admin-token");
  if (!provided || provided.length !== expected.length) return false;
  // Constant-time compare so the token cannot be guessed a character at a time.
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0;
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const supabase = getSupabaseAdmin();
    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId");
    const before = url.searchParams.get("before");

    // ---- list view -------------------------------------------------------
    if (!playerId) {
      const { data: players, error } = await supabase
        .from("players")
        .select("id, display_name, created_at, last_seen_at")
        .order("last_seen_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const ids = (players ?? []).map(p => p.id);
      const counts: Record<string, { sessions: number; lastDay: number }> = {};
      if (ids.length) {
        const { data: sessions } = await supabase
          .from("game_sessions")
          .select("player_id, state, updated_at")
          .in("player_id", ids)
          .order("updated_at", { ascending: false });
        for (const s of sessions ?? []) {
          const key = s.player_id as string;
          const day = Number((s.state as { day?: number })?.day ?? 0);
          if (!counts[key]) counts[key] = { sessions: 0, lastDay: 0 };
          counts[key].sessions += 1;
          counts[key].lastDay = Math.max(counts[key].lastDay, day);
        }
      }

      const { count: orphaned } = await supabase
        .from("game_sessions")
        .select("id", { count: "exact", head: true })
        .is("player_id", null);

      return NextResponse.json({
        players: (players ?? []).map(p => ({ ...p, ...(counts[p.id] ?? { sessions: 0, lastDay: 0 }) })),
        orphanedSessions: orphaned ?? 0,
      }, { headers: { "cache-control": "no-store" } });
    }

    // ---- one player ------------------------------------------------------
    const { data: player, error: playerError } = await supabase
      .from("players").select("id, display_name, created_at, last_seen_at").eq("id", playerId).single();
    if (playerError || !player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const { data: sessions, error: sessionError } = await supabase
      .from("game_sessions")
      .select("id, status, city, business_type, state, created_at, updated_at")
      .eq("player_id", playerId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (sessionError) throw sessionError;

    const sessionIds = (sessions ?? []).map(s => s.id);
    let events: unknown[] = [];
    let hasMore = false;
    if (sessionIds.length) {
      let query = supabase
        .from("game_events")
        .select("session_id, day, event_type, payload, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: false })
        .limit(EVENT_PAGE + 1);
      if (before) query = query.lt("created_at", before);
      const { data, error } = await query;
      if (error) throw error;
      hasMore = (data ?? []).length > EVENT_PAGE;
      events = (data ?? []).slice(0, EVENT_PAGE);
    }

    const { data: feedback } = await supabase
      .from("beta_feedback")
      .select("session_id, day, ease, gameplay, realism, decisions, continue_playing, comment, skipped, created_at")
      .or(`player_id.eq.${playerId}${sessionIds.length ? `,session_id.in.(${sessionIds.join(",")})` : ""}`)
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({
      player,
      sessions: sessions ?? [],
      events,
      hasMore,
      feedback: feedback ?? [],
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[admin/players] failed", error);
    return NextResponse.json({ error: "Unable to load player history." }, { status: 500 });
  }
}
