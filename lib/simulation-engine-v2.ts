import type { GameEventId, GameState, Decision } from "./simulation";

/**
 * V2 scenario layer. Kept separate from the existing turn calculator so it can
 * be tested independently before being wired into the production turn path.
 */
export type ScenarioContext = {
  day: number;
  state: GameState;
  recentEventIds: GameEventId[];
  recentDecisionIds: Decision[];
};

export type DelayedEffect = {
  id: string;
  sourceDay: number;
  applyOnDay: number;
  label: string;
  cashDelta?: number;
  reputationDelta?: number;
  qualityDelta?: number;
  inventoryDelta?: number;
  staffDelta?: number;
  supplierCostMultiplierDelta?: number;
};

const EVENT_COOLDOWN = 3;
const RAIN_COOLDOWN = 7;

function deterministicScore(seed: number, day: number, eventKey: string) {
  let value = (seed ^ Math.imul(day + 17, 2654435761)) >>> 0;
  for (let i = 0; i < eventKey.length; i += 1) value = Math.imul(value ^ eventKey.charCodeAt(i), 16777619) >>> 0;
  return value / 4294967296;
}

function eligible(ctx: ScenarioContext, id: GameEventId) {
  const recent = ctx.recentEventIds.slice(-EVENT_COOLDOWN);
  if (recent.includes(id)) return false;
  if (id === "rain" && ctx.day - ctx.state.lastEventDay < RAIN_COOLDOWN) return false;
  if (id === "stock-shortage" && ctx.state.inventory > 45) return false;
  if (id === "staff-absence" && ctx.state.staff < 60) return false;
  if (id === "equipment-issue" && ctx.state.format === "takeaway") return false;
  if (id === "supplier-increase" && ctx.state.supplierCostMultiplier >= 1.25) return false;
  if (id === "bad-review" && ctx.state.reputation > 78) return false;
  if (id === "viral-mention" && ctx.state.reputation < 55) return false;
  if (id === "bulk-order" && ctx.state.serviceCapacity < 120) return false;
  return true;
}

function weight(ctx: ScenarioContext, id: GameEventId) {
  let w = 1;
  if (id === "stock-shortage") w += Math.max(0, (50 - ctx.state.inventory) / 10);
  if (id === "staff-absence") w += Math.max(0, (ctx.state.staff - 60) / 20);
  if (id === "bad-review") w += Math.max(0, (65 - ctx.state.reputation) / 10);
  if (id === "viral-mention") w += Math.max(0, (ctx.state.reputation - 70) / 10);
  if (id === "competitor-promotion") w += ctx.state.priceIndex > 115 ? 1.5 : 0;
  if (id === "supplier-increase") w += ctx.state.supplierCostMultiplier <= 1.02 ? 1 : 0;
  if (id === "bulk-order") w += ctx.state.serviceCapacity >= 200 ? 1.5 : 0;
  if (id === "local-event") w += ctx.state.marketing >= 45 ? 1 : 0;
  if (id === "rain") w = 0.35;
  return w;
}

export function selectScenario(ctx: ScenarioContext, candidates: GameEventId[]): GameEventId | null {
  const eligibleEvents = candidates.filter((id) => eligible(ctx, id));
  if (!eligibleEvents.length) return null;
  const weighted = eligibleEvents.map((id) => ({ id, weight: weight(ctx, id) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = deterministicScore(ctx.state.seed, ctx.day, weighted.map((x) => x.id).join("|")) * total;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.id;
  }
  return weighted[weighted.length - 1].id;
}

export function createDelayedEffects(state: GameState, decision: Decision, day: number): DelayedEffect[] {
  const effects: DelayedEffect[] = [];
  if (decision === "hire") effects.push({ id: `hire-${day}`, sourceDay: day, applyOnDay: day + 7, label: "Additional payroll begins to weigh on margins", cashDelta: -18000, reputationDelta: 2 });
  if (decision === "marketing") effects.push({ id: `marketing-${day}`, sourceDay: day, applyOnDay: day + 3, label: "Marketing campaign lifts awareness", reputationDelta: 2, cashDelta: 5000 });
  if (decision === "quality") effects.push({ id: `quality-${day}`, sourceDay: day, applyOnDay: day + 5, label: "Quality improvements improve repeat demand", reputationDelta: 3, qualityDelta: 2 });
  if (decision === "inventory" && state.inventory > 80) effects.push({ id: `inventory-${day}`, sourceDay: day, applyOnDay: day + 4, label: "Extra stock creates a little wastage risk", inventoryDelta: -8, cashDelta: -3000 });
  if (decision === "raise-price" && state.priceIndex >= 118) effects.push({ id: `price-${day}`, sourceDay: day, applyOnDay: day + 5, label: "Higher prices start testing customer loyalty", reputationDelta: -2 });
  return effects;
}

export function applyDelayedEffect(state: GameState, effect: DelayedEffect): GameState {
  return {
    ...state,
    cash: Math.max(0, state.cash + (effect.cashDelta ?? 0)),
    reputation: Math.max(0, Math.min(100, state.reputation + (effect.reputationDelta ?? 0))),
    quality: Math.max(0, Math.min(100, state.quality + (effect.qualityDelta ?? 0))),
    inventory: Math.max(0, Math.min(100, state.inventory + (effect.inventoryDelta ?? 0))),
    staff: Math.max(0, Math.min(100, state.staff + (effect.staffDelta ?? 0))),
    supplierCostMultiplier: Math.max(1, state.supplierCostMultiplier + (effect.supplierCostMultiplierDelta ?? 0)),
    lastDayMessage: `${state.lastDayMessage}${state.lastDayMessage ? " " : ""}${effect.label}.`,
  };
}

export function shouldShowMilestone(day: number, cumulativeProfit: number, milestones: string[]) {
  const targets: Array<[number, string]> = [[7, "week-one"], [30, "month-one"], [90, "quarter-three"]];
  const timeMilestones = targets.filter(([target, id]) => day >= target && !milestones.includes(id)).map(([, id]) => id);
  const profitMilestone = cumulativeProfit >= 500000 && !milestones.includes("profit-500k") ? "profit-500k" : null;
  return { timeMilestones, profitMilestone };
}
