import { NextResponse } from "next/server";
import { applyDecision, advanceDay, type Decision, type GameState } from "@/lib/simulation";

const decisions = new Set<Decision>(["raise-price", "marketing", "hire", "quality", "inventory"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { state?: GameState; decision?: Decision };

    if (!body.state || !body.decision || !decisions.has(body.decision)) {
      return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
    }

    // Prototype boundary: this endpoint owns simulation calculations.
    // Before public launch, the state must be loaded from Supabase by session ID
    // rather than accepted as authoritative browser input.
    const afterDecision = applyDecision(body.state, body.decision);
    const nextState = advanceDay(afterDecision);

    return NextResponse.json({ state: nextState });
  } catch {
    return NextResponse.json({ error: "Unable to advance simulation." }, { status: 500 });
  }
}
