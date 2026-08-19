import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { applyDecision, advanceDay, applyEvent, generateEvent, type Decision, type GameState } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";
const decisions = new Set<Decision>(["raise-price", "marketing", "hire", "quality", "inventory"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { decision?: Decision; eventOption?: string };
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { data: session, error: loadError } = await supabase.from("game_sessions").select("id, state, status").eq("id", sessionId).single();
    if (loadError || !session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "This game is already finished." }, { status: 409 });

    let currentState = session.state as GameState;
    let resolvedEventTitle: string | null = null;
    if (currentState.currentEvent) {
      if (!body.eventOption) return NextResponse.json({ error: "Resolve the current business event first." }, { status: 409 });
      const valid = currentState.currentEvent.options.some((option) => option.id === body.eventOption);
      if (!valid) return NextResponse.json({ error: "Invalid event decision." }, { status: 400 });
      resolvedEventTitle = currentState.currentEvent.title;
      currentState = applyEvent(currentState, body.eventOption);
    }
    if (!body.decision || !decisions.has(body.decision)) return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });

    const nextState = advanceDay(applyDecision(currentState, body.decision));
    const event = generateEvent(nextState);
    nextState.currentEvent = event;
    const status = nextState.cash <= 0 ? "bankrupt" : nextState.profit > 0 && nextState.day >= 91 ? "won" : "active";

    const { error: updateError } = await supabase.from("game_sessions").update({ state: nextState, status }).eq("id", sessionId).eq("status", "active");
    if (updateError) throw updateError;

    const { error: eventError } = await supabase.from("game_events").insert({
      session_id: sessionId,
      day: nextState.day,
      event_type: event ? "business_event" : "day_advanced",
      payload: {
        decision: body.decision,
        eventOption: body.eventOption ?? null,
        resolvedEventTitle,
        eventId: event?.id ?? null,
        revenue: nextState.revenue,
        profit: nextState.profit,
        customers: nextState.customers,
        cash: nextState.cash,
        reputation: nextState.reputation,
        staff: nextState.staff,
        quality: nextState.quality,
        inventory: nextState.inventory,
        status,
      },
    });
    if (eventError) throw eventError;
    return NextResponse.json({ state: nextState, status });
  } catch (error) {
    console.error("[simulate-turn] failed", error);
    return NextResponse.json({ error: "Unable to advance simulation." }, { status: 500 });
  }
}
