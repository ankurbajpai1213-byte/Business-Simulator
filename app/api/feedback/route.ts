import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_COOKIE = "bs_session";
const PLAYER_COOKIE = "bs_player";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ease?: string; gameplay?: string; realism?: string; decisions?: string; continuePlaying?: string; comment?: string; skipped?: boolean; sessionDays?: number };
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
    const playerId = (await cookies()).get(PLAYER_COOKIE)?.value ?? null;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("game_events").insert({ session_id: sessionId, day: Number(body.sessionDays ?? 0), event_type: body.skipped ? "beta_feedback_skipped" : "beta_feedback", payload: { playerId, ease: body.ease ?? null, gameplay: body.gameplay ?? null, realism: body.realism ?? null, decisions: body.decisions ?? null, continuePlaying: body.continuePlaying ?? null, comment: body.comment?.slice(0, 2000) ?? null, skipped: Boolean(body.skipped) } });
    if (error) throw error;
    return NextResponse.json({ stored: true });
  } catch (error) {
    console.error("[feedback] failed", error);
    return NextResponse.json({ error: "Unable to store feedback." }, { status: 500 });
  }
}
