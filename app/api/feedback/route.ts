import { NextResponse } from "next/server";
import { getSessionIdentity, getOwnedSession } from "@/lib/sessionAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ease?: string; gameplay?: string; realism?: string; decisions?: string; continuePlaying?: string; comment?: string; skipped?: boolean; sessionDays?: number };
    const { sessionId, playerId } = await getSessionIdentity();
    if (!sessionId || !playerId) return NextResponse.json({ error: "No active game session." }, { status: 401 });

    const session = await getOwnedSession(sessionId, playerId);
    if (!session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });

    const supabase = getSupabaseAdmin();
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
