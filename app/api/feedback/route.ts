import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_COOKIE = "bs_session";
const PLAYER_COOKIE = "bs_player";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ease?: string;
      gameplay?: string;
      realism?: string;
      decisions?: string;
      continuePlaying?: string;
      comment?: string;
      skipped?: boolean;
      sessionDays?: number;
    };
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
    const playerId = (await cookies()).get(PLAYER_COOKIE)?.value ?? null;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("beta_feedback").insert({
      player_id: playerId,
      session_id: sessionId,
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
