import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { applyDecision, advanceDay, type Decision, type GameState } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";
const decisions = new Set<Decision>(["raise-price", "marketing", "hire", "quality", "inventory"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { decision?: Decision };
    if (!body.decision || !decisions.has(body.decision)) {
      return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
    }

    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: session, error: loadError } = await supabase
      .from("game_sessions")
      .select("id, state, status")
      .eq("id", sessionId)
      .single();

    if (loadError || !session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "This game is already finished." }, { status: 409 });

    const currentState = session.state as GameState;
    const nextState = advanceDay(applyDecision(currentState, body.decision));
    const status = nextState.cash <= 0 ? "bankrupt" : nextState.profit > 0 && nextState.day >= 91 ? "won" : "active";

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({ state: nextState, status })
      .eq("id", sessionId)
      .eq("status", "active");

    if (updateError) throw updateError;

    const { error: eventError } = await supabase.from("game_events").insert({
      session_id: sessionId,
      day: nextState.day,
      event_type: "day_advanced",
      payload: { decision: body.decision, revenue: nextState.revenue, profit: nextState.profit, status },
    });
    if (eventError) throw eventError;

    return NextResponse.json({ state: nextState, status });
  } catch {
    return NextResponse.json({ error: "Unable to advance simulation." }, { status: 500 });
  }
}
