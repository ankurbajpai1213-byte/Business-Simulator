import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_OWNER, type OwnerProfile, type Rank } from "@/lib/progression";

const PLAYER_COOKIE = "bs_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function toProfile(row: Record<string, unknown> | null): OwnerProfile {
  if (!row) return DEFAULT_OWNER;
  return {
    ownerReputation: Number(row.owner_reputation ?? DEFAULT_OWNER.ownerReputation),
    rank: (row.rank as Rank) ?? "founder",
    runsStarted: Number(row.runs_started ?? 0),
    runsCompleted: Number(row.runs_completed ?? 0),
    bestProfit: Number(row.best_profit ?? 0),
    bestDay: Number(row.best_day ?? 0),
  };
}

/** Who is playing, and what have they earned so far. */
export async function GET() {
  try {
    const id = (await cookies()).get(PLAYER_COOKIE)?.value;
    if (!id) return NextResponse.json({ player: null, owner: DEFAULT_OWNER, guest: true });
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("players")
      .select("id, display_name, owner_reputation, rank, runs_started, runs_completed, best_profit, best_day, auth_user_id")
      .eq("id", id).maybeSingle();
    if (!data) return NextResponse.json({ player: null, owner: DEFAULT_OWNER, guest: true });
    return NextResponse.json({
      player: { id: data.id, display_name: data.display_name },
      owner: toProfile(data as Record<string, unknown>),
      guest: !data.auth_user_id,
    });
  } catch (error) {
    console.error("[player] load failed", error);
    return NextResponse.json({ player: null, owner: DEFAULT_OWNER, guest: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = String(body.name ?? "").trim().slice(0, 60);
    if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });

    const cookieStore = await cookies();
    const id = cookieStore.get(PLAYER_COOKIE)?.value || crypto.randomUUID();

    let owner: OwnerProfile = DEFAULT_OWNER;
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("players")
        .upsert({ id, display_name: name, last_seen_at: new Date().toISOString() }, { onConflict: "id" })
        .select("owner_reputation, rank, runs_started, runs_completed, best_profit, best_day")
        .maybeSingle();
      owner = toProfile(data as Record<string, unknown> | null);
    } catch (dbError) {
      console.error("[player] could not persist player row", dbError);
    }

    const response = NextResponse.json({ player: { id, display_name: name }, owner });
    response.cookies.set(PLAYER_COOKIE, id, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("[player] failed", error);
    return NextResponse.json({ error: "Unable to save your name." }, { status: 400 });
  }
}
