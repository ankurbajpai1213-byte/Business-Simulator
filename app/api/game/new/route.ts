import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { INITIAL_STATE } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";
const PLAYER_COOKIE = "bs_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    const playerId = (await cookies()).get(PLAYER_COOKIE)?.value ?? null;
    const { data, error } = await supabase.from("game_sessions").insert({ city: "mumbai", business_type: "cafe", user_id: playerId, state: INITIAL_STATE, status: "active" }).select("id, state").single();
    if (error || !data) throw error ?? new Error("Unable to create new business.");
    const response = NextResponse.json({ state: data.state, sessionId: data.id });
    response.cookies.set(SESSION_COOKIE, data.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
    return response;
  } catch (error) {
    console.error("[game/new] failed", error);
    return NextResponse.json({ error: "Unable to start a new business." }, { status: 500 });
  }
}
