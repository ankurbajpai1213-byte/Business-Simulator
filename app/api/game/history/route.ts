import { NextResponse } from "next/server";
import { getSessionIdentity, getOwnedSession } from "@/lib/sessionAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { sessionId, playerId } = await getSessionIdentity();
    if (!sessionId || !playerId) return NextResponse.json({ error: "No active game session." }, { status: 401 });

    const session = await getOwnedSession(sessionId, playerId);
    if (!session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("game_events")
      .select("id, day, event_type, payload, created_at")
      .eq("session_id", sessionId)
      .neq("event_type", "business_setup")
      .order("day", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ history: data ?? [] });
  } catch (error) {
    console.error("[game-history] failed", error);
    return NextResponse.json({ error: "Unable to load past days." }, { status: 500 });
  }
}
