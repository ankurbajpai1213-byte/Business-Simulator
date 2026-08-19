import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createConfiguredState, type BusinessFormat, type Location, type MenuItemId } from "@/lib/simulation";
import { CAPITAL_OPTIONS } from "@/lib/capital";

const SESSION_COOKIE = "bs_session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { capital?: number; location?: Location; format?: BusinessFormat; menu?: MenuItemId[] };
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { data: session, error: loadError } = await supabase.from("game_sessions").select("id, state, status").eq("id", sessionId).single();
    if (loadError || !session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "This game is already open. Start a new business to change the setup." }, { status: 409 });
    if ((session.state as { setupComplete?: boolean }).setupComplete) return NextResponse.json({ error: "This business is already configured. Start a new business to try a different setup." }, { status: 409 });

    const capital = Number(body.capital);
    if (!CAPITAL_OPTIONS.includes(capital as typeof CAPITAL_OPTIONS[number])) return NextResponse.json({ error: "Choose a valid starting capital." }, { status: 400 });
    const state = createConfiguredState({
      capital,
      location: body.location as Location,
      format: body.format as BusinessFormat,
      menu: Array.isArray(body.menu) ? body.menu : [],
    });
    const { data: updated, error } = await supabase.from("game_sessions").update({ state }).eq("id", sessionId).eq("status", "active").eq("state->>setupComplete", "false").select("id").maybeSingle();
    if (error) throw error;
    if (!updated) return NextResponse.json({ error: "This business has already been configured. Start a new business to try a different setup." }, { status: 409 });
    await supabase.from("game_events").insert({ session_id: sessionId, day: 1, event_type: "business_setup", payload: { capital: state.capital, location: state.location, format: state.format, menu: state.menu, setupCost: state.setupCost } });
    return NextResponse.json({ state });
  } catch (error) {
    console.error("[game/setup] Setup failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to configure business." }, { status: 400 });
  }
}
