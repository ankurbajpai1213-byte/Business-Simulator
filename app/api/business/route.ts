import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_COOKIE = "bs_session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = String(body.name ?? "").trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: "Please enter a business name." }, { status: 400 });
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { data: session, error: loadError } = await supabase.from("game_sessions").select("id, state, status").eq("id", sessionId).single();
    if (loadError || !session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "This game is already finished." }, { status: 409 });
    const state = (session.state ?? {}) as Record<string, unknown>;
    if (state.setupComplete) return NextResponse.json({ error: "Your business is already open." }, { status: 409 });
    const nextState = { ...state, businessName: name };
    const { error } = await supabase.from("game_sessions").update({ state: nextState }).eq("id", sessionId);
    if (error) throw error;
    await supabase.from("game_events").insert({ session_id: sessionId, day: Number(nextState.day ?? 1), event_type: "business_name_set", payload: { businessName: name } });
    return NextResponse.json({ businessName: name, state: nextState });
  } catch (error) {
    console.error("[business] name failed", error);
    return NextResponse.json({ error: "Unable to save business name." }, { status: 500 });
  }
}
