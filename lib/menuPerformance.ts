/**
 * Which menu lines are earning their place.
 *
 * Items differ in margin and in how much of your trade they carry. A line that
 * sells steadily on a thin margin can still be worth more than a high-margin
 * item nobody orders. Dropping something is allowed, but the money already sunk
 * into equipment does not come back — you recover a fraction, not the lot.
 */

import { MENU_ITEMS, type GameState, type MenuItemId } from "./simulation";

export type MenuLine = {
  id: MenuItemId;
  name: string;
  share: number;        // share of customers who order it
  weeklyCost: number;
  weeklyRevenue: number;
  weeklyProfit: number;
  verdict: "star" | "steady" | "quiet" | "drag";
  note: string;
};

/**
 * Popularity is deterministic per item and per business, so the same cafe always
 * sees the same pattern. Cheap, familiar items carry volume; expensive ones carry
 * margin. No randomness — the player should be able to learn this.
 */
function popularity(id: MenuItemId, seed: number): number {
  const item = MENU_ITEMS.find(x => x.id === id);
  if (!item) return 0;
  // Cheaper lines get ordered more. Everything gets a small stable wobble.
  const affordability = 1.6 - Math.min(1.2, item.setupCost / 90000);
  let x = (seed ^ (id.length * 2654435761)) >>> 0;
  for (let i = 0; i < id.length; i += 1) x = (Math.imul(x ^ id.charCodeAt(i), 16777619)) >>> 0;
  const wobble = 0.82 + ((x >>> 0) / 4294967296) * 0.36;
  return Math.max(0.15, affordability * wobble);
}

export function menuPerformance(state: GameState): MenuLine[] {
  const ids = state.menu;
  if (!ids.length) return [];
  const weights = ids.map(id => popularity(id, state.seed));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const weeklyCustomers = Math.max(0, state.customers) * 7;
  const spendPerHead = state.customers > 0 ? state.revenue / state.customers : 0;

  const lines = ids.map((id, i) => {
    const item = MENU_ITEMS.find(x => x.id === id)!;
    const share = weights[i] / total;
    const orders = weeklyCustomers * share;
    // Pricier lines carry a higher ticket than the average head spend.
    const ticket = spendPerHead * (0.7 + Math.min(1.1, item.setupCost / 70000));
    const weeklyRevenue = Math.round(orders * ticket);
    const weeklyCost = item.weeklyCost;
    const weeklyProfit = Math.round(weeklyRevenue * 0.68) - weeklyCost;
    return { id, name: item.name, share, weeklyCost, weeklyRevenue, weeklyProfit };
  });

  const bestProfit = Math.max(...lines.map(l => l.weeklyProfit), 1);
  return lines.map(l => {
    let verdict: MenuLine["verdict"];
    let note: string;
    if (l.weeklyProfit < 0) {
      verdict = "drag";
      note = `Costs ${Math.abs(l.weeklyProfit).toLocaleString("en-IN")} more each week than it brings in.`;
    } else if (l.weeklyProfit > bestProfit * 0.6 && l.share > 0.06) {
      verdict = "star";
      note = "Carrying real weight. Protect this one.";
    } else if (l.share < 0.035) {
      verdict = "quiet";
      note = "Barely ordered. It is not losing money, but it is not doing much either.";
    } else {
      verdict = "steady";
      note = "Pulling its weight without drawing attention.";
    }
    return { ...l, verdict, note };
  }).sort((a, b) => b.weeklyProfit - a.weeklyProfit);
}

/**
 * Dropping a line. The equipment is already bought and mostly cannot be sold on,
 * so you recover about a third — and if it was popular, some customers who came
 * for it stop coming.
 */
export function discontinueCost(state: GameState, id: MenuItemId): { writeOff: number; recovered: number; reputationHit: number; share: number } {
  const item = MENU_ITEMS.find(x => x.id === id);
  const line = menuPerformance(state).find(l => l.id === id);
  const share = line?.share ?? 0;
  const setup = item?.setupCost ?? 0;
  const recovered = Math.round(setup * 0.32);
  return {
    writeOff: setup - recovered,
    recovered,
    // Removing something popular annoys the people who came for it.
    reputationHit: share > 0.08 ? 3.5 : share > 0.04 ? 1.5 : 0.4,
    share,
  };
}
