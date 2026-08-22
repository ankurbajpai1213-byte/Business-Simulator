import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function authorized(request: Request) {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  return Boolean(expected && request.headers.get("x-admin-token") === expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: players, error } = await supabase.from("players").select("id,display_name,created_at,last_seen_at").order("last_seen_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: sessions } = await supabase.from("game_sessions").select("id,player_id,status,city,business_type,state,created_at,updated_at").order("updated_at", { ascending: false });
  const { data: events } = await supabase.from("game_events").select("session_id,day,event_type,payload,created_at").order("created_at", { ascending: false }).limit(1000);
  const { data: feedback } = await supabase.from("beta_feedback").select("player_id,session_id,day,ease,gameplay,realism,decisions,continue_playing,comment,skipped,created_at").order("created_at", { ascending: false }).limit(1000);
  return NextResponse.json({ players: players ?? [], sessions: sessions ?? [], events: events ?? [], feedback: feedback ?? [] });
}
