import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { INITIAL_STATE, upgradeLegacyState, type GameState } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";
const RELEASE_COOKIE = "bs_game_release";
const CURRENT_RELEASE = "v2-2026-08-20";
const PLAYER_COOKIE = "bs_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function responseWithSession(body: { state: GameState; sessionId: string }, sessionId: string) {
  const response = NextResponse.json(body);
  response.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
  response.cookies.set(RELEASE_COOKIE, CURRENT_RELEASE, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
  return response;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const existingId = cookieStore.get(SESSION_COOKIE)?.value;
    const release = cookieStore.get(RELEASE_COOKIE)?.value;
    const playerId = cookieStore.get(PLAYER_COOKIE)?.value ?? null;
    const supabase = getSupabaseAdmin();

    if (existingId && release === CURRENT_RELEASE) {
      const { data, error } = await supabase.from("game_sessions").select("id, state, user_id").eq("id", existingId).eq("status", "active").maybeSingle();
      if (error) throw error;
      if (data) {
        const state = upgradeLegacyState(data.state as Partial<GameState>);
        if ((data.state as Partial<GameState>).version !== 4 || typeof (data.state as Partial<GameState>).wastageToday !== "number") await supabase.from("game_sessions").update({ state }).eq("id", data.id);
        if (playerId && !data.user_id) await supabase.from("game_sessions").update({ user_id: playerId }).eq("id", data.id);
        return NextResponse.json({ state, sessionId: data.id, playerId: playerId ?? data.user_id ?? null });
      }
    }

    if (existingId) {
      await supabase.from("game_sessions").update({ status: "superseded" }).eq("id", existingId).eq("status", "active");
    }

    const { data, error } = await supabase.from("game_sessions").insert({ city: "mumbai", business_type: "cafe", user_id: playerId, state: INITIAL_STATE, status: "active" }).select("id, state, user_id").single();
    if (error || !data) throw error ?? new Error("Unable to create game session.");
    return responseWithSession({ state: data.state as GameState, sessionId: data.id }, data.id);
  } catch (error) {
    console.error("[game/session] Game session service failed:", error);
    return NextResponse.json({ error: "Game session service is not configured." }, { status: 503 });
  }
}
