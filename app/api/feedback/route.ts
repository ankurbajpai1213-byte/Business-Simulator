import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ stored: false, message: "Feedback endpoint is ready; Supabase is not configured yet." });
  }

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await supabase.from("player_feedback").insert({
    rating: body.rating,
    replay: body.replay ?? null,
    realism: body.realism ?? null,
    difficulty: body.difficulty ?? null,
    comment: body.comment?.slice(0, 4000) ?? null,
    session_days: body.sessionDays ?? null,
  });

  if (error) return NextResponse.json({ error: "Unable to store feedback." }, { status: 500 });
  return NextResponse.json({ stored: true });
}
