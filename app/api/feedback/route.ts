import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionIdentity, getOwnedSession } from "@/lib/sessionAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ease?: string; gameplay?: string; realism?: string; decisions?: string; continuePlaying?: string; comment?: string; skipped?: boolean; sessionDays?: number };
    // Feedback may only be filed against a session the player actually owns.
    const { sessionId, playerId } = await getSessionIdentity();
    if (!sessionId || !playerId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const owned = await getOwnedSession(sessionId, playerId);
    if (!owned) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    const supabase = getSupabaseAdmin();
    // A second submission for the same session and day is a duplicate, not new data.
    if (sessionId) {
      const { data: existing } = await supabase
        .from("beta_feedback")
        .select("id")
        .eq("session_id", sessionId)
        .eq("day", Number(body.sessionDays ?? 0))
        .limit(1);
      if (existing && existing.length) return NextResponse.json({ ok: true, note: "already recorded" });
    }

    const { error } = await supabase.from("beta_feedback").insert({
      session_id: sessionId,
      player_id: playerId,
      day: Number(body.sessionDays ?? 0),
      ease: body.ease ?? null,
      gameplay: body.gameplay ?? null,
      realism: body.realism ?? null,
      decisions: body.decisions ?? null,
      continue_playing: body.continuePlaying ?? null,
      comment: body.comment?.slice(0, 2000) ?? null,
      skipped: Boolean(body.skipped),
    });
    if (error) throw error;
    return NextResponse.json({ stored: true });
  } catch (error) {
    console.error("[feedback] failed", error);
    return NextResponse.json({ error: "Unable to store feedback." }, { status: 500 });
  }
}
