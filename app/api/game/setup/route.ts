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
    const capital = Number(body.capital);
    if (!CAPITAL_OPTIONS.includes(capital as typeof CAPITAL_OPTIONS[number])) return NextResponse.json({ error: "Choose a valid starting capital." }, { status: 400 });

    // The simulation's legacy helper still has the old capital list. Use the nearest
    // supported validation value, then restore the player's exact selected capital.
    const validationCapital = capital === 3500000 ? 5000000 : capital;
    const state = createConfiguredState({
      capital: validationCapital,
      location: body.location as Location,
      format: body.format as BusinessFormat,
      menu: Array.isArray(body.menu) ? body.menu : [],
    });
    if (capital !== validationCapital) {
      state.capital = capital;
      state.cash -= validationCapital - capital;
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("game_sessions").update({ state }).eq("id", sessionId).eq("status", "active");
    if (error) throw error;
    await supabase.from("game_events").insert({ session_id: sessionId, day: 1, event_type: "business_setup", payload: { capital: state.capital, location: state.location, format: state.format, menu: state.menu, setupCost: state.setupCost } });
    return NextResponse.json({ state });
  } catch (error) {
    console.error("[game/setup] Setup failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to configure business." }, { status: 400 });
  }
}
