/**
 * Business acumen — a read on how the player is actually running things.
 *
 * Five dimensions, scored from behaviour rather than from money. A player can be
 * rich and careless, or poor and sharp. The number is a summary; the coaching is
 * the part that matters, and it speaks up more when someone is struggling and
 * stays quiet when they are not.
 */

import type { GameState } from "./simulation";

export type Dimension = "finance" | "operations" | "people" | "market" | "strategy";

export type AcumenRead = {
  scores: Record<Dimension, number>;   // 0–100
  overall: number;
  stage: "founder" | "operator" | "manager" | "multi" | "portfolio";
  nextStage: string;
  nextRequirement: string;
  coaching: string | null;             // one line, or nothing if they are doing fine
};

const LABEL: Record<Dimension, string> = {
  finance: "Financial management", operations: "Operations",
  people: "People management", market: "Customers and market", strategy: "Strategic thinking",
};
export const DIMENSION_LABEL = LABEL;

export function readAcumen(state: GameState & { manager?: unknown; supplyContract?: boolean; investments?: string[] }): AcumenRead {
  const days = Math.max(1, state.day - 1);
  const runwayDays = state.profit < 0 ? state.cash / Math.max(1, Math.abs(state.profit)) : 90;
  const goodShare = state.profitableDays / Math.max(1, state.profitableDays + state.lossDays);

  const finance = clamp(
    35 + (state.cumulativeProfit > 0 ? 25 : -15)
    + Math.min(20, runwayDays / 3)
    + (goodShare - 0.5) * 60);

  const operations = clamp(
    40 + (state.inventory >= 25 && state.inventory <= 80 ? 18 : -12)
    + Math.min(18, (state.daysSinceStockout ?? 0) / 3)
    - (state.wastageToday > 2500 ? 10 : 0));

  const people = clamp(
    30 + (state.manager ? 22 : 0)
    + (state.serviceCapacity > 0 ? Math.min(22, (1 - Math.abs(0.75 - state.customers / state.serviceCapacity)) * 30) : 0)
    + (state.staff >= 55 ? 10 : -8));

  const market = clamp(
    20 + state.reputation * 0.45
    + (state.quality >= 70 ? 12 : 0)
    - (state.consecutivePriceRaises >= 2 ? 12 : 0));

  const strategy = clamp(
    25 + (state.supplyContract ? 15 : 0)
    + (state.investments?.length ?? 0) * 9
    + Math.min(20, state.milestones.length * 1.1)
    + (state.cumulativeProfit > 500000 ? 12 : 0));

  const scores = { finance, operations, people, market, strategy };
  const overall = Math.round((finance + operations + people + market + strategy) / 5);

  // Founder -> Operator: three months survived and cumulatively in profit.
  const survivedQuarter = state.day > 90;
  const profitableQuarter = state.cumulativeProfit > 0;
  const stage: AcumenRead["stage"] = survivedQuarter && profitableQuarter ? "operator" : "founder";

  return {
    scores, overall, stage,
    nextStage: stage === "founder" ? "Operator" : "Manager",
    nextRequirement: stage === "founder"
      ? survivedQuarter
        ? "Finish three months in profit. You have the time in — the books need to be in the black."
        : `Run the cafe for three months and finish them in profit. ${Math.max(0, 91 - state.day)} days to go.`
      : "Hire and delegate. Run the business through other people rather than doing it all yourself.",
    coaching: coach(state, scores, days),
  };
}

function clamp(n: number): number { return Math.round(Math.max(0, Math.min(100, n))); }

/**
 * One line, only when it is worth saying. Weak players hear more; strong players
 * are left alone. Never tells them which button to press.
 */
function coach(state: GameState & { manager?: unknown }, s: Record<Dimension, number>, days: number): string | null {
  const doingWell = s.finance > 62 && s.operations > 62 && s.market > 55;
  const burn = Math.max(2, Math.round(Math.max(1, state.customers) / 18));

  if (state.profit < 0 && state.cash < Math.abs(state.profit) * 12)
    return "The runway is short. Rent does not wait for a good week.";
  if (state.inventory < 22)
    return `Supplies are thin — about ${Math.round(state.inventory / burn)} days at this rate.`;
  if (state.reputation > state.quality + 8)
    return "People think better of you than what you are currently serving. That gap closes downwards.";
  if (state.consecutivePriceRaises >= 2)
    return "Two rises in a row. Regulars keep count even when they say nothing.";
  if (s.people < 42 && state.serviceCapacity > 0 && state.customers / state.serviceCapacity > 0.9)
    return "You are turning people away at the busiest hours and doing it all yourself.";
  if (s.people < 42 && state.customers / Math.max(1, state.serviceCapacity) < 0.45)
    return "You are paying for room and hands you are not using.";
  if (doingWell && days > 120 && !state.manager)
    return "The business runs well. It still runs entirely on you.";
  if (s.strategy < 40 && days > 100)
    return "You are operating carefully but not building anything. Cash sitting still earns nothing.";
  if (doingWell) return null;   // leave a good player alone
  if (s.finance < 40) return "More days are costing you than earning. Something in the model is not working.";
  return null;
}
