/**
 * Choosing your crew.
 *
 * The game used to staff the cafe for you, which is why a player could end up
 * paying for hands they never needed and had no way to let go. Now you decide who
 * you open with — and whether you work the floor yourself.
 *
 * The trade throughout: every person you hire serves more customers and costs
 * money every single day, whether they are busy or not.
 */

import type { BusinessFormat } from "./simulation";

export type RoleId = "barista" | "server" | "cook" | "manager";

export type Role = {
  id: RoleId;
  name: string;
  blurb: string;
  dailyWage: number;
  capacity: number;      // people they let you serve per day
  quality: number;       // contribution to what goes out
  requiresKitchen?: boolean;
  max: number;
};

export const ROLES: Role[] = [
  { id: "barista", name: "Barista", blurb: "Makes the drinks. Without one, nothing moves.", dailyWage: 850, capacity: 55, quality: 5, max: 4 },
  { id: "server",  name: "Server",  blurb: "Takes orders and clears tables, so the queue keeps moving.", dailyWage: 650, capacity: 40, quality: 2, max: 5 },
  { id: "cook",    name: "Cook",    blurb: "Runs the kitchen. Needed for anything hot.", dailyWage: 1100, capacity: 35, quality: 7, requiresKitchen: true, max: 3 },
  { id: "manager", name: "Manager", blurb: "Runs the floor so you do not have to be there.", dailyWage: 1400, capacity: 25, quality: 3, max: 1 },
];

export type OwnerRole = "hands-on" | "balanced" | "delegating";

export const OWNER_ROLES: Array<{ id: OwnerRole; name: string; blurb: string; capacity: number; quality: number; wageSaving: number; note: string }> = [
  { id: "hands-on", name: "Behind the counter", blurb: "You work the floor yourself, every day.",
    capacity: 45, quality: 6, wageSaving: 850,
    note: "Cheapest way to start — and the hardest to walk away from later." },
  { id: "balanced", name: "In and out", blurb: "You are there for the busy hours and the decisions.",
    capacity: 22, quality: 3, wageSaving: 400,
    note: "A middle path. You will feel it if the place gets busy." },
  { id: "delegating", name: "Owner, not staff", blurb: "You run the business; other people run the cafe.",
    capacity: 0, quality: 0, wageSaving: 0,
    note: "Costs more from day one, but your time stays your own." },
];

export type Crew = Partial<Record<RoleId, number>>;

export function crewCost(crew: Crew): { dailyWage: number; hiringCost: number; headcount: number } {
  let dailyWage = 0, hiringCost = 0, headcount = 0;
  for (const role of ROLES) {
    const n = crew[role.id] ?? 0;
    dailyWage += role.dailyWage * n;
    // Finding and settling in each person costs about three weeks of their wage.
    hiringCost += Math.round(role.dailyWage * 21) * n;
    headcount += n;
  }
  return { dailyWage, hiringCost, headcount };
}

export function crewCapacity(crew: Crew, owner: OwnerRole, format: BusinessFormat): number {
  const ownerRole = OWNER_ROLES.find(o => o.id === owner)!;
  let capacity = ownerRole.capacity;
  for (const role of ROLES) capacity += role.capacity * (crew[role.id] ?? 0);
  // A bigger room can hold more people; a kiosk cannot, however many you hire.
  const ceiling = format === "takeaway" ? 190 : format === "small-cafe" ? 320 : 520;
  return Math.max(20, Math.min(ceiling, Math.round(capacity)));
}

export function crewQuality(crew: Crew, owner: OwnerRole): number {
  const ownerRole = OWNER_ROLES.find(o => o.id === owner)!;
  let q = 58 + ownerRole.quality;
  for (const role of ROLES) q += role.quality * Math.min(2, crew[role.id] ?? 0);
  return Math.max(35, Math.min(85, Math.round(q)));
}

/** Staff level as the engine understands it, 0–100. */
export function crewStaffLevel(crew: Crew, owner: OwnerRole): number {
  const { headcount } = crewCost(crew);
  const ownerHands = owner === "hands-on" ? 1 : owner === "balanced" ? 0.5 : 0;
  return Math.max(0, Math.min(100, Math.round((headcount + ownerHands) * 16)));
}

/**
 * An honest read on whether this crew can cope, given the menu and format.
 * Told before they commit, not discovered three weeks in.
 */
export function crewVerdict(crew: Crew, owner: OwnerRole, format: BusinessFormat, menuSize: number, needsKitchen: boolean): { tone: "thin" | "fair" | "heavy"; message: string } {
  const { headcount, dailyWage } = crewCost(crew);
  const hands = headcount + (owner === "hands-on" ? 1 : owner === "balanced" ? 0.5 : 0);
  const cooks = crew.cook ?? 0;

  if (needsKitchen && cooks === 0) {
    return { tone: "thin", message: "You have hot food on the menu and nobody to cook it. Quality will suffer badly." };
  }
  if (hands < 1) {
    return { tone: "thin", message: "Nobody is going to be behind the counter. You cannot open like this." };
  }
  const perHead = menuSize / Math.max(1, hands);
  if (perHead > 6) {
    return { tone: "thin", message: `${menuSize} items and ${hands === Math.round(hands) ? hands : hands.toFixed(1)} pair${hands === 1 ? "" : "s"} of hands. It will be tight from the first busy day.` };
  }
  if (dailyWage > 4200 && menuSize < 8) {
    return { tone: "heavy", message: `${formatWage(dailyWage)} a day in wages for a short menu. You will be paying people to stand about.` };
  }
  return { tone: "fair", message: `${formatWage(dailyWage)} a day in wages. A sensible crew for what you are opening.` };
}

function formatWage(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** A reasonable starting crew, so nobody has to work it out from nothing. */
export function suggestedCrew(format: BusinessFormat, needsKitchen: boolean): Crew {
  if (format === "takeaway") return { barista: 1 };
  if (format === "small-cafe") return needsKitchen ? { barista: 1, server: 1, cook: 1 } : { barista: 1, server: 1 };
  return needsKitchen ? { barista: 2, server: 2, cook: 1 } : { barista: 2, server: 2 };
}
