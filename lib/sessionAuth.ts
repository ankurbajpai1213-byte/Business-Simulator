import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_COOKIE = "bs_session";
const PLAYER_COOKIE = "bs_player";

export async function getSessionIdentity() {
  const cookieStore = await cookies();
  return {
    sessionId: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    playerId: cookieStore.get(PLAYER_COOKIE)?.value ?? null,
  };
}

/**
 * Load a session only when it belongs to the current anonymous player.
 * This is the application-level authorization boundary for the cookie-based
 * game identity used by the prototype.
 */
export async function getOwnedSession(sessionId: string | null, playerId: string | null) {
  if (!sessionId || !playerId) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("game_sessions")
    .select("id, state, status, user_id, player_id")
    .eq("id", sessionId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
