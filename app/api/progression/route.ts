import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionIdentity, getOwnedSession } from "@/lib/sessionAuth";
import { readAcumen } from "@/lib/acumen";
import { DEFAULT_OWNER, earnedRank, updateOwnerReputation, rankProgress, RANK_LABEL, type OwnerProfile, type Rank, type RunOutcome } from "@/lib/progression";
import type { GameState } from "@/lib/simulation";

/**
 * Settle up what the current run has earned the owner.
 *
 * Rank and unlocks are never taken away — a business closing does not undo what
 * the owner learned — but standing moves both ways.
 */
export async function POST() {
  try {
    const { sessionId, playerId } = await getSessionIdentity();
    if (!playerId) return NextResponse.json({ error: "No player." }, { status: 401 });
    const supabase = getSupabaseAdmin();

    const { data: row } = await supabase
      .from("players")
      .select("owner_reputation, rank, runs_started, runs_completed, best_profit, best_day")
      .eq("id", playerId).maybeSingle();

    const owner: OwnerProfile = row ? {
      ownerReputation: Number(row.owner_reputation ?? 30),
      rank: (row.rank as Rank) ?? "founder",
      runsStarted: Number(row.runs_started ?? 0),
      runsCompleted: Number(row.runs_completed ?? 0),
      bestProfit: Number(row.best_profit ?? 0),
      bestDay: Number(row.best_day ?? 0),
    } : DEFAULT_OWNER;

    const session = sessionId ? await getOwnedSession(sessionId, playerId) : null;
    if (!session) return NextResponse.json({ owner, progress: rankProgress(owner, {}), acumen: 0, promoted: null });

    const state = session.state as GameState;
    const acumen = readAcumen(state as Parameters<typeof readAcumen>[0]).overall;
    const run: RunOutcome = {
      daysSurvived: Math.max(0, state.day - 1),
      cumulativeProfit: state.cumulativeProfit,
      businessReputation: state.reputation,
      acumen,
      bankrupt: state.cash <= 0,
      completedYear: state.day > 365,
      managerHired: Boolean(state.manager),
      decisionsMade: state.dayHistory.length,
    };

    const newRank = earnedRank(owner, run);
    const promoted = newRank !== owner.rank;
    const finished = run.bankrupt || run.completedYear;
    const newRep = finished ? updateOwnerReputation(owner, run) : owner.ownerReputation;

    if (promoted || finished) {
      await supabase.from("players").update({
        rank: newRank,
        owner_reputation: newRep,
        runs_completed: owner.runsCompleted + (finished ? 1 : 0),
        best_profit: Math.max(owner.bestProfit, run.cumulativeProfit),
        best_day: Math.max(owner.bestDay, run.daysSurvived),
        last_seen_at: new Date().toISOString(),
      }).eq("id", playerId);
    }

    const updated: OwnerProfile = { ...owner, rank: newRank, ownerReputation: newRep };
    return NextResponse.json({
      owner: updated, acumen,
      promoted: promoted ? { to: newRank, label: RANK_LABEL[newRank] } : null,
      progress: rankProgress(updated, run),
    });
  } catch (error) {
    console.error("[progression] failed", error);
    return NextResponse.json({ error: "Unable to read progression." }, { status: 500 });
  }
}
