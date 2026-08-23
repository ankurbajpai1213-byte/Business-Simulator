/**
 * Somewhere for accumulated money to go.
 *
 * By the second half of a run a successful player is sitting on cash with nothing
 * to spend it on, and the game stops asking questions. These are the answers:
 * large, one-off commitments that change the business rather than nudge a number,
 * each carrying an ongoing responsibility as well as a benefit.
 */

import type { GameState } from "./simulation";

export type InvestmentId = "refit" | "second-counter" | "brand" | "kitchen-upgrade" | "terrace" | "buy-lease";

export type Investment = {
  id: InvestmentId;
  name: string;
  cost: number;
  unlockDay: number;
  what: string;
  gain: string;
  responsibility: string;
};

export const INVESTMENTS: Investment[] = [
  {
    id: "refit", name: "Refit the room", cost: 180000, unlockDay: 120,
    what: "New furniture, lighting and a proper counter. The place stops looking like a start-up.",
    gain: "People stay longer and expect to pay a little more.",
    responsibility: "A smarter room raises expectations. Slipping quality is punished harder.",
  },
  {
    id: "second-counter", name: "Open a second counter", cost: 220000, unlockDay: 140,
    what: "A second service point so the queue moves at the busiest hours.",
    gain: "Serve considerably more people a day.",
    responsibility: "Another counter needs another pair of hands. Wages rise.",
  },
  {
    id: "kitchen-upgrade", name: "Upgrade the kitchen", cost: 260000, unlockDay: 160,
    what: "Better equipment, more reliable, faster.",
    gain: "Quality holds up on its own and equipment troubles become rarer.",
    responsibility: "More machinery to keep running, and more to go wrong at once.",
  },
  {
    id: "brand", name: "Build the brand", cost: 200000, unlockDay: 180,
    what: "A proper identity, signage, and a presence people recognise beyond the street.",
    gain: "Awareness stops decaying and reputation carries further.",
    responsibility: "A recognised name means a bad week travels as fast as a good one.",
  },
  {
    id: "terrace", name: "Take the terrace", cost: 320000, unlockDay: 200,
    what: "Lease the space upstairs and put tables on it.",
    gain: "A large jump in how many people you can seat.",
    responsibility: "More rent, every month, whether the terrace is full or empty.",
  },
  {
    id: "buy-lease", name: "Buy out the lease", cost: 900000, unlockDay: 240,
    what: "Purchase the premises outright instead of renting them.",
    gain: "No more rent, and no more landlord asking for more.",
    responsibility: "An enormous amount of your cash is now in bricks, not in the bank.",
  },
];

export function availableInvestments(state: GameState & { investments?: InvestmentId[] }): Investment[] {
  const owned = new Set(state.investments ?? []);
  return INVESTMENTS.filter(i => state.day >= i.unlockDay && !owned.has(i.id));
}

export type InvestmentEffects = {
  capacityBonus: number;
  rentMultiplier: number;
  payrollDaily: number;
  qualityDrift: number;
  marketingDecayFactor: number;
  reputationCeilingBonus: number;
  priceTolerance: number;
  eventShield: number;
};

export function investmentEffects(owned: InvestmentId[] = []): InvestmentEffects {
  const has = (id: InvestmentId) => owned.includes(id);
  return {
    capacityBonus: (has("second-counter") ? 55 : 0) + (has("terrace") ? 90 : 0),
    // Buying the lease removes rent entirely; the terrace adds to it.
    rentMultiplier: (has("buy-lease") ? 0 : 1) + (has("terrace") && !has("buy-lease") ? 0.28 : 0),
    payrollDaily: (has("second-counter") ? 1600 : 0) + (has("terrace") ? 2100 : 0),
    qualityDrift: has("kitchen-upgrade") ? 0.1 : 0,
    marketingDecayFactor: has("brand") ? 0.45 : 1,
    reputationCeilingBonus: has("refit") ? 4 : 0,
    priceTolerance: has("refit") ? 0.04 : 0,
    eventShield: has("kitchen-upgrade") ? 0.5 : 0,
  };
}
