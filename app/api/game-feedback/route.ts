import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionIdentity } from "@/lib/sessionAuth";

/** Feedback about the game itself, not about the cafe in the game. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rating?: number; message?: string; context?: Record<string, unknown> };
    const message = String(body.message ?? "").trim().slice(0, 4000);
    if (!message) return NextResponse.json({ error: "Say something first." }, { status: 400 });
    const rating = Number(body.rating);

    const { sessionId, playerId } = await getSessionIdentity();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("game_feedback").insert({
      player_id: playerId,
      session_id: sessionId,
      rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? Math.round(rating) : null,
      message,
      context: body.context ?? {},
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[game-feedback] failed", error);
    return NextResponse.json({ error: "Unable to send that just now." }, { status: 500 });
  }
}
