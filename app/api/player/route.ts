import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PLAYER_COOKIE = "bs_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET() {
  try {
    const id = (await cookies()).get(PLAYER_COOKIE)?.value;
    if (!id) return NextResponse.json({ player: null });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("players").select("id, display_name").eq("id", id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ player: data ?? null });
  } catch (error) {
    console.error("[player] lookup failed", error);
    return NextResponse.json({ error: "Unable to load player." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = String(body.name ?? "").trim().slice(0, 60);
    if (name.length < 1) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const existingId = (await cookies()).get(PLAYER_COOKIE)?.value;
    let player = null;
    if (existingId) {
      const { data, error } = await supabase.from("players").update({ display_name: name, last_seen_at: new Date().toISOString() }).eq("id", existingId).select("id, display_name").maybeSingle();
      if (error) throw error;
      player = data;
    }
    if (!player) {
      const { data, error } = await supabase.from("players").insert({ display_name: name }).select("id, display_name").single();
      if (error) throw error;
      player = data;
    }
    const response = NextResponse.json({ player });
    response.cookies.set(PLAYER_COOKIE, player.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE });
    return response;
  } catch (error) {
    console.error("[player] create failed", error);
    return NextResponse.json({ error: "Unable to save player." }, { status: 500 });
  }
}
