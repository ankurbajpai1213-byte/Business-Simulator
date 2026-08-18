export type GameState = {
  day: number;
  cash: number;
  revenue: number;
  profit: number;
  customers: number;
  reputation: number;
  priceIndex: number;
  marketing: number;
  staff: number;
  quality: number;
  inventory: number;
  location: "high-footfall" | "residential" | "premium";
};

export type Decision = "raise-price" | "marketing" | "hire" | "quality" | "inventory";

export const INITIAL_STATE: GameState = {
  day: 1,
  cash: 500000,
  revenue: 0,
  profit: 0,
  customers: 0,
  reputation: 50,
  priceIndex: 100,
  marketing: 50,
  staff: 70,
  quality: 65,
  inventory: 100,
  location: "high-footfall",
};

const locationDemand = {
  "high-footfall": 1.2,
  residential: 0.9,
  premium: 1.0,
};

export function applyDecision(state: GameState, decision: Decision): GameState {
  const next = { ...state };

  switch (decision) {
    case "raise-price":
      next.priceIndex = Math.min(140, next.priceIndex + 8);
      break;
    case "marketing":
      if (next.cash >= 10000) {
        next.cash -= 10000;
        next.marketing = Math.min(100, next.marketing + 12);
      }
      break;
    case "hire":
      if (next.cash >= 18000) {
        next.cash -= 18000;
        next.staff = Math.min(100, next.staff + 12);
      }
      break;
    case "quality":
      if (next.cash >= 12000) {
        next.cash -= 12000;
        next.quality = Math.min(100, next.quality + 8);
      }
      break;
    case "inventory":
      if (next.cash >= 8000) {
        next.cash -= 8000;
        next.inventory = Math.min(100, next.inventory + 20);
      }
      break;
  }

  return next;
}

export function advanceDay(state: GameState): GameState {
  const demandFactor =
    locationDemand[state.location] *
    (state.reputation / 100) *
    (state.quality / 100) *
    (state.staff / 100) *
    (1 + state.marketing / 500) *
    (100 / state.priceIndex);

  const baseCustomers = 250;
  const customers = Math.max(0, Math.round(baseCustomers * demandFactor * (0.88 + Math.random() * 0.24)));
  const averageTicket = 380 * (state.priceIndex / 100);
  const revenue = Math.round(customers * averageTicket);

  const rent = state.location === "premium" ? 30000 : state.location === "high-footfall" ? 24000 : 17000;
  const payroll = 19000 + Math.round(state.staff * 95);
  const inventoryCost = Math.round(revenue * 0.34);
  const marketingSpend = Math.round(state.marketing * 90);
  const operatingCost = rent + payroll + inventoryCost + marketingSpend;
  const profit = revenue - operatingCost;

  const reputationDelta = profit > 0 ? 1 : -1;
  const nextReputation = Math.max(0, Math.min(100, state.reputation + reputationDelta));

  return {
    ...state,
    day: state.day + 1,
    cash: Math.round(state.cash + profit),
    revenue,
    profit,
    customers,
    reputation: nextReputation,
    inventory: Math.max(0, state.inventory - Math.round(customers / 8)),
    marketing: Math.max(25, state.marketing - 2),
  };
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
