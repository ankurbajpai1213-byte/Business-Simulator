import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createConfiguredState, getPreset, type BusinessFormat, type Location, type MenuItemId } from "@/lib/simulation";
import { CAPITAL_OPTIONS } from "@/lib/capital";
import { getOwnedSession } from "@/lib/sessionAuth";

const SESSION_COOKIE = "bs_session";
const PLAYER_COOKIE = "bs_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { capital?: number; location?: Location; format?: BusinessFormat; menu?: MenuItemId[]; businessName?: string; preset?: string; crew?: Record<string, number>; ownerRole?: "hands-on" | "balanced" | "delegating"; crewWage?: number; crewCapacity?: number; crewQuality?: number; crewStaff?: number; hiringCost?: number };
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value || null;
    const playerId = cookieStore.get(PLAYER_COOKIE)?.value ?? null;

    const supabase = getSupabaseAdmin();
    if (sessionId) {
      // Only configure a session that belongs to this player. Every other route
      // already checks this; setup was the last one relying on the cookie alone.
      const session = await getOwnedSession(sessionId, playerId);
      if (!session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
      if (session.status !== "active") return NextResponse.json({ error: "This game is already finished." }, { status: 409 });
      if ((session.state as { setupComplete?: boolean }).setupComplete) return NextResponse.json({ error: "This business is already open. Start a new game to change the setup." }, { status: 409 });
    }

    const businessName = String(body.businessName ?? "").trim().slice(0, 40);
    if (!businessName) return NextResponse.json({ error: "Give your cafe a name first." }, { status: 400 });

    // A preset is the primary path; explicit fields remain supported for future custom setup.
    const preset = body.preset ? getPreset(body.preset) : undefined;
    if (body.preset && !preset) return NextResponse.json({ error: "Choose one of the starting options." }, { status: 400 });

    const capital = preset ? preset.capital : Number(body.capital);
    if (!CAPITAL_OPTIONS.includes(capital as typeof CAPITAL_OPTIONS[number])) return NextResponse.json({ error: "Choose a valid starting capital." }, { status: 400 });

    const state = createConfiguredState({
      capital,
      location: preset ? preset.location : (body.location as Location),
      format: preset ? preset.format : (body.format as BusinessFormat),
      menu: preset ? preset.menu : (Array.isArray(body.menu) ? body.menu : []),
      businessName,
      // The crew the player actually chose, priced and validated on the server.
      crew: body.crew ?? {},
      ownerRole: body.ownerRole ?? "balanced",
      crewWage: Math.max(0, Math.min(60000, Number(body.crewWage ?? 0))),
      crewCapacity: Math.max(20, Math.min(520, Number(body.crewCapacity ?? 0))) || undefined,
      crewQuality: Math.max(35, Math.min(85, Number(body.crewQuality ?? 0))) || undefined,
      crewStaff: Math.max(0, Math.min(100, Number(body.crewStaff ?? 0))) || undefined,
      hiringCost: Math.max(0, Math.min(1500000, Number(body.hiringCost ?? 0))),
    });

    // The row is created here — the first moment the player has committed to anything.
    let liveId: string = sessionId ?? "";
    if (liveId) {
      const { data: updated, error } = await supabase.from("game_sessions").update({ state, user_id: playerId, player_id: playerId }).eq("id", liveId).eq("status", "active").eq("state->>setupComplete", "false").select("id").maybeSingle();
      if (error) throw error;
      if (!updated) return NextResponse.json({ error: "This business has already been configured. Start a new game to try a different setup." }, { status: 409 });
    } else {
      const { data: created, error } = await supabase.from("game_sessions")
        .insert({ city: "mumbai", business_type: "cafe", user_id: playerId, player_id: playerId, state, status: "active" })
        .select("id").single();
      if (error || !created) throw error ?? new Error("Unable to create the game session.");
      liveId = created.id;
    }

    await supabase.from("game_events").insert({ session_id: liveId, day: 1, event_type: "business_setup", payload: { businessName, preset: body.preset ?? null, capital: state.capital, location: state.location, format: state.format, menu: state.menu, setupCost: state.setupCost } });

    const response = NextResponse.json({ state });
    response.cookies.set(SESSION_COOKIE, liveId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
    return response;
  } catch (error) {
    console.error("[game/setup] Setup failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to configure business." }, { status: 400 });
  }
}
