import { NextResponse } from "next/server";
import { getSessionIdentity, getOwnedSession } from "@/lib/sessionAuth";
import { INITIAL_STATE, upgradeLegacyState, type GameState } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";
const RELEASE_COOKIE = "bs_game_release";
const CURRENT_RELEASE = "v2-2026-08-20";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function GET() {
  try {
    const { sessionId: existingId, playerId } = await getSessionIdentity();
    const cookieStore = await (await import("next/headers")).cookies();
    const release = cookieStore.get(RELEASE_COOKIE)?.value;

    if (existingId && playerId && release === CURRENT_RELEASE) {
      const data = await getOwnedSession(existingId, playerId);
      if (data && data.status === "active") {
        const state = upgradeLegacyState(data.state as Partial<GameState>);
        if ((data.state as Partial<GameState>).version !== 4 || typeof (data.state as Partial<GameState>).wastageToday !== "number") {
          const { getSupabaseAdmin } = await import("@/lib/supabaseAdmin");
          await getSupabaseAdmin().from("game_sessions").update({ state }).eq("id", data.id).eq("player_id", playerId);
        }
        return NextResponse.json({ state, sessionId: data.id, playerId });
      }
    }

    if (existingId && playerId) {
      const { getSupabaseAdmin } = await import("@/lib/supabaseAdmin");
      await getSupabaseAdmin().from("game_sessions").update({ status: "superseded" }).eq("id", existingId).eq("player_id", playerId).eq("status", "active");
    }

    const response = NextResponse.json({ state: INITIAL_STATE, sessionId: null, playerId });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    response.cookies.set(RELEASE_COOKIE, CURRENT_RELEASE, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
    return response;
  } catch (error) {
    console.error("[game/session] Game session service failed:", error);
    return NextResponse.json({ error: "Game session service is not configured." }, { status: 503 });
  }
}
