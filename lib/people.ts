/**
 * Managers and suppliers you actually have to choose between.
 *
 * The rule everywhere here: you pick two or three qualities, never all of them.
 * A manager who is brilliant with people is rarely also brilliant with food.
 * A supplier with the best rates is rarely the most reliable. Every hire is a
 * trade, and the cost of the trade shows up months later.
 */

export type ManagerTrait =
  | "punctual" | "loyal" | "organised" | "people" | "food" | "hospitality" | "thrifty";

export type SupplierTrait =
  | "cheap" | "reliable" | "quality" | "flexible" | "local";

export const MANAGER_TRAITS: Array<{ id: ManagerTrait; label: string; blurb: string }> = [
  { id: "punctual", label: "Punctual", blurb: "Opens on time, every time. Nothing slips." },
  { id: "loyal", label: "Loyal", blurb: "Will not be poached the moment someone offers more." },
  { id: "organised", label: "Organised", blurb: "Stock, rotas and orders never fall apart." },
  { id: "people", label: "Good with people", blurb: "Staff stay, and they work better." },
  { id: "food", label: "Knows food", blurb: "Protects quality when you are not looking." },
  { id: "hospitality", label: "Natural host", blurb: "Customers feel looked after." },
  { id: "thrifty", label: "Careful with money", blurb: "Waste and overspending get noticed." },
];

export const SUPPLIER_TRAITS: Array<{ id: SupplierTrait; label: string; blurb: string }> = [
  { id: "cheap", label: "Good rates", blurb: "Lower cost per sale." },
  { id: "reliable", label: "Always on time", blurb: "Deliveries arrive when promised." },
  { id: "quality", label: "Better produce", blurb: "What you serve is noticeably better." },
  { id: "flexible", label: "Takes short notice", blurb: "Emergency orders are possible." },
  { id: "local", label: "Local and known", blurb: "Customers like that you buy nearby." },
];

/** Two or three chosen. Anything more is a fantasy, not a hire. */
export const MAX_MANAGER_TRAITS = 3;
export const MAX_SUPPLIER_TRAITS = 2;

export type Manager = { traits: ManagerTrait[]; hiredOnDay: number; salaryDaily: number };
export type Supplier = { traits: SupplierTrait[]; signedOnDay: number };

/** What a manager costs. More demanded, more paid. */
export function managerSalary(traits: ManagerTrait[]): number {
  const base = 2200;
  const premium: Partial<Record<ManagerTrait, number>> = {
    people: 600, food: 700, organised: 500, hospitality: 500, loyal: 400, punctual: 300, thrifty: 300,
  };
  return base + traits.reduce((sum, t) => sum + (premium[t] ?? 0), 0);
}

export type ManagerEffects = {
  qualityDrift: number;      // offsets the daily decay when they know food
  serviceRelief: number;     // 0–1, how much service strain they absorb
  reputationDaily: number;   // hospitality shows up as goodwill
  wastageFactor: number;     // thrifty managers lose less
  stockSteadiness: number;   // organised managers keep shelves sensible
  poachResistance: number;   // loyal managers do not leave
};

export function managerEffects(manager: Manager | null): ManagerEffects {
  const none: ManagerEffects = { qualityDrift: 0, serviceRelief: 0, reputationDaily: 0, wastageFactor: 1, stockSteadiness: 0, poachResistance: 0 };
  if (!manager) return none;
  const has = (t: ManagerTrait) => manager.traits.includes(t);
  return {
    // Someone who knows food holds the line on quality. Someone who does not,
    // does not — however good they are with people.
    qualityDrift: has("food") ? 0.14 : 0,
    serviceRelief: (has("organised") ? 0.3 : 0) + (has("people") ? 0.25 : 0) + (has("punctual") ? 0.1 : 0),
    reputationDaily: (has("hospitality") ? 0.22 : 0) + (has("people") ? 0.08 : 0),
    wastageFactor: has("thrifty") ? 0.7 : 1,
    stockSteadiness: has("organised") ? 0.35 : 0,
    poachResistance: has("loyal") ? 1 : 0,
  };
}

export type SupplierEffects = {
  cogsFactor: number;        // multiplier on cost of goods
  autoRestock: number;       // share of daily burn replaced without ordering
  qualityDaily: number;      // better produce lifts quality slowly
  emergencyDiscount: number; // flexible suppliers make crises cheaper
  reputationDaily: number;   // buying local is worth something locally
  failureChance: number;     // unreliable suppliers miss deliveries
};

export function supplierEffects(supplier: Supplier | null): SupplierEffects {
  const none: SupplierEffects = { cogsFactor: 1, autoRestock: 0, qualityDaily: 0, emergencyDiscount: 0, reputationDaily: 0, failureChance: 0 };
  if (!supplier) return none;
  const has = (t: SupplierTrait) => supplier.traits.includes(t);
  return {
    // Cheap rates cost you elsewhere: the produce is not as good.
    cogsFactor: (has("cheap") ? 0.93 : 1.04) * (has("quality") ? 1.03 : 1),
    autoRestock: has("reliable") ? 0.92 : 0.62,
    qualityDaily: has("quality") ? 0.1 : has("cheap") ? -0.06 : 0,
    emergencyDiscount: has("flexible") ? 0.45 : 0,
    reputationDaily: has("local") ? 0.06 : 0,
    // A supplier who is not reliable will let you down eventually.
    failureChance: has("reliable") ? 0 : 0.035,
  };
}

/** Plain-language summary of what you have just committed to. */
export function supplierSummary(traits: SupplierTrait[]): string {
  const has = (t: SupplierTrait) => traits.includes(t);
  const good: string[] = [];
  const bad: string[] = [];
  if (has("cheap")) { good.push("cheaper stock"); if (!has("quality")) bad.push("produce is ordinary"); }
  else good.push("fair rates");
  if (has("reliable")) good.push("deliveries you can count on");
  else bad.push("they will miss a delivery sooner or later");
  if (has("quality")) good.push("noticeably better produce");
  if (has("flexible")) good.push("emergency orders cost less");
  if (has("local")) good.push("goodwill for buying nearby");
  return `${good.join(", ")}. ${bad.length ? bad.join(", ") + "." : ""}`.trim();
}
