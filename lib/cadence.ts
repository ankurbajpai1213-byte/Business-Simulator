/* Time structure: the game zooms out as the business matures. */

export type Stage = { id: string; label: string; unit: string; days: number };

export const RUN_LENGTH_DAYS = 365;

export function stageFor(day: number): Stage {
  if (day <= 7) return { id: "daily", label: "Opening week", unit: "day", days: 1 };
  if (day <= 90) return { id: "weekly", label: "Finding your feet", unit: "week", days: 7 };
  if (day <= 180) return { id: "fortnightly", label: "Settling in", unit: "fortnight", days: 14 };
  return { id: "monthly", label: "The long haul", unit: "month", days: 30 };
}

/**
 * Periods are fixed on the calendar, not counted from wherever the player happens
 * to be. Week two is always days 15–21. If a turn is interrupted on day 17, the
 * next turn covers days 18–21 — the rest of that same week — rather than starting
 * a fresh seven days. Without this, every interruption silently added a whole extra
 * week of decisions and spending.
 */
export function periodStart(day: number): number {
  if (day <= 7) return day;
  if (day <= 90) return 8 + Math.floor((day - 8) / 7) * 7;
  if (day <= 180) return 91 + Math.floor((day - 91) / 14) * 14;
  return 181 + Math.floor((day - 181) / 30) * 30;
}

export function periodEnd(day: number): number {
  const start = periodStart(day);
  const full = stageFor(start).days;
  const stageLast = day <= 7 ? 7 : day <= 90 ? 90 : day <= 180 ? 180 : RUN_LENGTH_DAYS;
  return Math.min(start + full - 1, stageLast, RUN_LENGTH_DAYS);
}

/** Days left in the current period. */
export function daysThisTurn(day: number): number {
  return Math.max(1, periodEnd(day) - day + 1);
}

/** How much of the current period is still ahead, 0–1. */
export function periodRemaining(day: number): number {
  const start = periodStart(day);
  const full = Math.max(1, periodEnd(start) - start + 1);
  return Math.max(0, Math.min(1, daysThisTurn(day) / full));
}

export function turnLabel(day: number): string {
  const s = stageFor(day);
  const end = periodEnd(day);
  const partial = day > periodStart(day);
  if (s.id === "daily") return `Day ${day}`;
  if (s.id === "weekly") {
    const week = Math.floor((periodStart(day) - 8) / 7) + 2;
    return partial ? `Rest of week ${week}` : `Week ${week}`;
  }
  if (s.id === "fortnightly") return partial ? `Rest of days ${periodStart(day)}–${end}` : `Days ${day}–${end}`;
  const month = Math.floor((periodStart(day) - 181) / 30) + 7;
  return partial ? `Rest of month ${month}` : `Month ${month}`;
}

export function periodName(day: number): string {
  const s = stageFor(day);
  return s.id === "daily" ? "day" : s.unit;
}

export type Interruption = { day: number; reason: "stockout" | "cash-critical" | "event"; message: string };

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

/**
 * Actions available this turn, scaled to how much of the period is actually left.
 * Four days of a broken week gets one action, not the full two — otherwise an
 * interruption doubles both the decisions and the spending for the same stretch
 * of time, which is exactly what made interrupted weeks feel unfair.
 */
export function slotsForTurn(day: number): number {
  const id = stageFor(day).id;
  const full = id === "daily" ? 1 : id === "weekly" ? 2 : 3;
  if (full === 1) return 1;
  return Math.max(1, Math.round(full * periodRemaining(day)));
}
