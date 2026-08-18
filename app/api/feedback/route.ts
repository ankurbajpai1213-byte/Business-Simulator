import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_COOKIE = "bs_session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      rating?: number;
      replay?: boolean;
      realism?: number;
      difficulty?: number;
      comment?: string;
      sessionDays?: number;
    };

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("player_feedback").insert({
      session_id: sessionId,
      rating: body.rating,
      replay: body.replay ?? null,
      realism: body.realism ?? null,
      difficulty: body.difficulty ?? null,
      comment: body.comment?.slice(0, 4000) ?? null,
      session_days: body.sessionDays ?? null,
    });

    if (error) throw error;
    return NextResponse.json({ stored: true });
  } catch {
    return NextResponse.json({ error: "Unable to store feedback." }, { status: 500 });
  }
}
