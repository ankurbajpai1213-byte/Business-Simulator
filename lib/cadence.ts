/* Time structure: the game zooms out as the business matures. */

export type Stage = { id: string; label: string; unit: string; days: number };

export const RUN_LENGTH_DAYS = 365;

export function stageFor(day: number): Stage {
  if (day <= 7) return { id: "daily", label: "Opening week", unit: "day", days: 1 };
  if (day <= 90) return { id: "weekly", label: "Finding your feet", unit: "week", days: 7 };
  if (day <= 180) return { id: "fortnightly", label: "Settling in", unit: "fortnight", days: 14 };
  return { id: "monthly", label: "The long haul", unit: "month", days: 30 };
}

/** Days this turn covers, never running past the end of the year. */
export function daysThisTurn(day: number): number {
  return Math.max(1, Math.min(stageFor(day).days, RUN_LENGTH_DAYS + 1 - day));
}

export function turnLabel(day: number): string {
  const s = stageFor(day);
  if (s.id === "daily") return `Day ${day}`;
  if (s.id === "weekly") return `Week ${Math.ceil((day - 1) / 7) + 1}`;
  if (s.id === "fortnightly") return `Days ${day}–${day + daysThisTurn(day) - 1}`;
  return `Month ${Math.ceil(day / 30)}`;
}

export function periodName(day: number): string {
  const s = stageFor(day);
  return s.id === "daily" ? "day" : s.unit;
}

export type Interruption = { day: number; reason: "stockout" | "cash-critical"; message: string };

export type SpanReport = {
  interrupted?: Interruption | null;
  days: number;
  fromDay: number;
  toDay: number;
  revenue: number;
  profit: number;
  customers: number;
  bestDay: { day: number; customers: number; profit: number } | null;
  worstDay: { day: number; customers: number; profit: number } | null;
  profitableDays: number;
  lossDays: number;
};

/** How many actions the player may take in one turn. */
export function slotsForTurn(day: number): number {
  const id = stageFor(day).id;
  if (id === "daily") return 1;
  if (id === "weekly") return 2;
  return 3;
}
