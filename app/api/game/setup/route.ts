import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createConfiguredState, type BusinessFormat, type Location, type MenuItemId } from "@/lib/simulation";

const SESSION_COOKIE = "bs_session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { capital?: number; location?: Location; format?: BusinessFormat; menu?: MenuItemId[] };
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const state = createConfiguredState({
      capital: Number(body.capital),
      location: body.location as Location,
      format: body.format as BusinessFormat,
      menu: Array.isArray(body.menu) ? body.menu : [],
    });
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
