import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_COOKIE = "bs_session";

export async function GET() {
  try {
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("game_events")
      .select("id, day, event_type, payload, created_at")
      .eq("session_id", sessionId)
      .order("day", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ history: data ?? [] });
  } catch (error) {
    console.error("[game-history] failed", error);
    return NextResponse.json({ error: "Unable to load past days." }, { status: 500 });
  }
}
