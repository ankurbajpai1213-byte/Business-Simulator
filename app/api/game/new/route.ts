import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { INITIAL_STATE } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const existingId = cookieStore.get(SESSION_COOKIE)?.value;
    const supabase = getSupabaseAdmin();

    // Close the old run, but do not open a new row until the player sets up a cafe.
    // Only the owner may abandon a run.
    const playerId = cookieStore.get("bs_player")?.value ?? null;
    if (existingId) await supabase.from("game_sessions").update({ status: "abandoned" })
      .eq("id", existingId).eq("status", "active")
      .eq("player_id", playerId ?? "00000000-0000-0000-0000-000000000000");

    const response = NextResponse.json({ state: INITIAL_STATE, sessionId: null });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("[game/new] failed", error);
    return NextResponse.json({ error: "Unable to start a new business." }, { status: 500 });
  }
}
