import { NextResponse } from "next/server";
import { getSessionIdentity, getOwnedSession } from "@/lib/sessionAuth";
import { INITIAL_STATE } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";

export async function POST() {
  try {
    const { sessionId, playerId } = await getSessionIdentity();

    if (sessionId && playerId) {
      const session = await getOwnedSession(sessionId, playerId);
      if (session?.status === "active") {
        const { getSupabaseAdmin } = await import("@/lib/supabaseAdmin");
        await getSupabaseAdmin().from("game_sessions").update({ status: "abandoned" }).eq("id", sessionId).eq("player_id", playerId).eq("status", "active");
      }
    }

    const response = NextResponse.json({ state: INITIAL_STATE, sessionId: null });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("[game/new] failed", error);
    return NextResponse.json({ error: "Unable to start a new business." }, { status: 500 });
  }
}
