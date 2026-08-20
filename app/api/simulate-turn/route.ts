import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { applyDecision, advanceDay, applyEvent, generateEvent, isDecisionAvailable, type Decision, type GameEventId, type GameState } from "@/lib/simulation";
import { applyDelayedEffect, createDelayedEffects, shouldShowMilestone, type DelayedEffect } from "@/lib/simulation-engine-v2";
import { daysThisTurn, slotsForTurn, RUN_LENGTH_DAYS, type Interruption, type SpanReport } from "@/lib/cadence";

const SESSION_COOKIE = "bs_session";
const decisions = new Set<Decision>(["raise-price", "lower-price", "marketing", "hire", "quality", "inventory", "no-action"]);
type V2State = GameState & { pendingDelayedEffects?: DelayedEffect[] };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { decision?: Decision; decisions?: Decision[]; eventOption?: string };
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ error: "No active game session." }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { data: session, error: loadError } = await supabase.from("game_sessions").select("id, state, status").eq("id", sessionId).single();
    if (loadError || !session) return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "This game is already finished." }, { status: 409 });

    const originalState = session.state as V2State;
    const expectedDay = originalState.day;
    const turnCashBefore = originalState.cash;
    let currentState = originalState;
    let resolvedEventTitle: string | null = null;
    let resolvedEventId: GameEventId | null = null;
    let resolvedEventOption: string | null = null;

    // Apply delayed consequences that became due before today's new decision.
    const dueEffects = (currentState.pendingDelayedEffects ?? []).filter((effect) => effect.applyOnDay <= currentState.day);
    if (dueEffects.length) {
      for (const effect of dueEffects) currentState = applyDelayedEffect(currentState, effect) as V2State;
      currentState.pendingDelayedEffects = (currentState.pendingDelayedEffects ?? []).filter((effect) => effect.applyOnDay > currentState.day);
    }

    if (currentState.currentEvent) {
      if (!body.eventOption) return NextResponse.json({ error: "Resolve the current business event first." }, { status: 409 });
      const option = currentState.currentEvent.options.find((item) => item.id === body.eventOption);
      if (!option) return NextResponse.json({ error: "Invalid event decision." }, { status: 400 });
      if (currentState.cash < option.cost) return NextResponse.json({ error: `That event option needs ${option.cost.toLocaleString("en-IN")} more cash than you currently have.` }, { status: 409 });
      resolvedEventTitle = currentState.currentEvent.title;
      resolvedEventId = currentState.currentEvent.id;
      resolvedEventOption = body.eventOption;
      currentState = applyEvent(currentState, body.eventOption) as V2State;

      // Ignoring a repair should come back to bite, not vanish.
      if (resolvedEventId === "equipment-issue" && body.eventOption === "delay-repair") {
        currentState.pendingDelayedEffects = [
          ...(currentState.pendingDelayedEffects ?? []),
          { id: `breakdown-${currentState.day}`, sourceDay: currentState.day, applyOnDay: currentState.day + 9,
            label: "The equipment you left unrepaired finally failed. A day of trade lost and stock spoiled",
            cashDelta: -42000, qualityDelta: -10, inventoryDelta: -18, reputationDelta: -4 },
        ];
      }
    }

    // Accept a list of actions; a single decision stays valid for older clients.
    const requested: Decision[] = Array.isArray(body.decisions) && body.decisions.length
      ? body.decisions
      : body.decision ? [body.decision] : [];
    if (!requested.length || requested.some(d => !decisions.has(d))) return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
    if (new Set(requested).size !== requested.length) return NextResponse.json({ error: "Each action can only be chosen once per turn." }, { status: 400 });
    if (requested.includes("raise-price") && requested.includes("lower-price")) return NextResponse.json({ error: "You cannot raise and lower prices in the same turn." }, { status: 400 });
    const slots = slotsForTurn(expectedDay);
    if (requested.length > slots) return NextResponse.json({ error: `You can take at most ${slots} action${slots > 1 ? "s" : ""} this turn.` }, { status: 400 });

    const stateBeforeDecision = currentState;
    // Validate and apply in order; each must still be affordable after the previous one.
    for (const action of requested) {
      if (!isDecisionAvailable(currentState, action)) return NextResponse.json({ error: "One of those actions is not available yet, is already at its maximum, or there is not enough cash for it." }, { status: 409 });
      currentState = applyDecision(currentState, action) as V2State;
    }
    const primary: Decision = requested.find(d => d !== "no-action") ?? requested[0];
    const turnSpend = Math.max(0, turnCashBefore - currentState.cash);
    const rainToday = resolvedEventId === "rain";

    // The turn may cover one day, a week, a fortnight or a month.
    const span = daysThisTurn(expectedDay);
    const fromDay = currentState.day;
    let nextState = currentState;
    const report: SpanReport = { interrupted: null, days: span, fromDay, toDay: fromDay, revenue: 0, profit: 0, customers: 0, bestDay: null, worstDay: null, profitableDays: 0, lossDays: 0 };

    for (let i = 0; i < span; i += 1) {
      // Immediate spend and any event weather only land on the first day of the span.
      const dayDecision = primary;
      const spend = i === 0 ? turnSpend : 0;
      const rain = i === 0 ? rainToday : false;

      // Delayed consequences falling due inside the span still land on time.
      const due = (nextState.pendingDelayedEffects ?? []).filter(e => e.applyOnDay <= nextState.day);
      if (due.length) {
        for (const effect of due) nextState = applyDelayedEffect(nextState, effect) as V2State;
        nextState.pendingDelayedEffects = (nextState.pendingDelayedEffects ?? []).filter(e => e.applyOnDay > nextState.day);
      }

      // Do not simulate a day the business cannot trade through.
      if (i > 0 && nextState.inventory < 2) {
        report.interrupted = { day: nextState.day, reason: "stockout", message: "You have run out of stock. The cafe cannot open again until you restock." };
        report.days = i;
        break;
      }

      const dayNumber = nextState.day;
      nextState = advanceDay(nextState, dayDecision, spend, rain, i === 0 ? resolvedEventId : null, i === 0 ? resolvedEventOption : null) as V2State;

      report.revenue += nextState.revenue;
      report.profit += nextState.profit;
      report.customers += nextState.customers;
      report.toDay = dayNumber;
      if (nextState.profit > 0) report.profitableDays += 1;
      if (nextState.profit < 0) report.lossDays += 1;
      const snapshot = { day: dayNumber, customers: nextState.customers, profit: Math.round(nextState.profit) };
      if (!report.bestDay || snapshot.profit > report.bestDay.profit) report.bestDay = snapshot;
      if (!report.worstDay || snapshot.profit < report.worstDay.profit) report.worstDay = snapshot;

      if (nextState.cash <= 0) break; // stop early rather than simulate a dead business

      // The business should not sit closed for days the player cannot influence.
      const lastDayOfSpan = i === span - 1;
      if (!lastDayOfSpan) {
        let stop: Interruption | null = null;
        if (nextState.inventory < 14) {
          stop = { day: nextState.day, reason: "stockout", message: "Stock is nearly gone. Another busy day and you will be turning people away while the rent still has to be paid." };
        } else if (nextState.profit < 0 && nextState.cash < Math.abs(nextState.profit) * 5) {
          stop = { day: nextState.day, reason: "cash-critical", message: "Cash is running dangerously low. At this rate the business has only a few days left." };
        }
        if (stop) { report.interrupted = stop; report.days = i + 1; break; }
      }
    }

    // Queue consequences so the decision can matter after the day it was made.
    const newEffects = requested.flatMap(action => createDelayedEffects(stateBeforeDecision, action, expectedDay));
    nextState.pendingDelayedEffects = [
      ...(nextState.pendingDelayedEffects ?? []),
      ...newEffects,
    ];

    const milestoneUpdate = shouldShowMilestone(nextState.day, nextState.cumulativeProfit, nextState.milestones);
    nextState.milestones = [
      ...new Set([
        ...nextState.milestones,
        ...milestoneUpdate.timeMilestones,
        ...(milestoneUpdate.profitMilestone ? [milestoneUpdate.profitMilestone] : []),
      ]),
    ];

    const event = generateEvent(nextState);
    nextState.currentEvent = event;

    const status = nextState.cash <= 0
      ? "bankrupt"
      : nextState.day > RUN_LENGTH_DAYS && nextState.cumulativeProfit > 0
        ? "won"
        : nextState.day > RUN_LENGTH_DAYS
          ? "completed"
          : "active";

    const { data: updated, error: updateError } = await supabase
      .from("game_sessions")
      .update({ state: nextState, status })
      .eq("id", sessionId)
      .eq("status", "active")
      .eq("state->>day", String(expectedDay))
      .select("id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ error: "This turn was already submitted. Refresh the game and continue from the latest day." }, { status: 409 });

    const { error: eventError } = await supabase.from("game_events").insert({
      session_id: sessionId,
      day: nextState.day - 1,
      event_type: event ? "business_event" : "day_advanced",
      payload: {
        decision: primary,
        decisions: requested,
        eventOption: resolvedEventOption,
        resolvedEventTitle,
        resolvedEventId,
        eventId: event?.id ?? null,
        revenue: nextState.revenue,
        profit: nextState.profit,
        customers: nextState.customers,
        totalCustomers: nextState.totalCustomers,
        cashBefore: turnCashBefore,
        cash: nextState.cash,
        turnSpend,
        reputation: nextState.reputation,
        staff: nextState.staff,
        quality: nextState.quality,
        inventory: nextState.inventory,
        priceIndex: nextState.priceIndex,
        cumulativeRevenue: nextState.cumulativeRevenue,
        cumulativeProfit: nextState.cumulativeProfit,
        milestones: nextState.milestones,
        delayedEffectsQueued: newEffects,
        delayedEffectsApplied: dueEffects,
        dayMessage: nextState.lastDayMessage,
        spanDays: span,
        spanReport: report,
        status,
      },
    });
    if (eventError) throw eventError;
    return NextResponse.json({ state: nextState, status, report, dayMessage: nextState.lastDayMessage });
  } catch (error) {
    console.error("[simulate-turn] failed", error);
    return NextResponse.json({ error: "Unable to advance simulation." }, { status: 500 });
  }
}
