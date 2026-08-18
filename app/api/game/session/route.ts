import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { INITIAL_STATE, type GameState } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function responseWithSession(body: { state: GameState; sessionId: string }, sessionId: string) {
  const response = NextResponse.json(body);
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const existingId = cookieStore.get(SESSION_COOKIE)?.value;
    const supabase = getSupabaseAdmin();

    if (existingId) {
      const { data, error } = await supabase
        .from("game_sessions")
        .select("id, state")
        .eq("id", existingId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      if (data) return NextResponse.json({ state: data.state as GameState, sessionId: data.id });
    }

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({ city: "mumbai", business_type: "cafe", state: INITIAL_STATE, status: "active" })
      .select("id, state")
      .single();

    if (error || !data) throw error ?? new Error("Unable to create game session.");
    return responseWithSession({ state: data.state as GameState, sessionId: data.id }, data.id);
  } catch {
    return NextResponse.json({ error: "Game session service is not configured." }, { status: 503 });
  }
}
