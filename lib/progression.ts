/**
 * Owner progression.
 *
 * Everything here belongs to the person playing, not to any one cafe. A business
 * closing does not erase what the owner learned — rank and unlocks survive, though
 * a failure costs standing.
 *
 * Every threshold lives in this file so it can be tuned without touching logic.
 */

export type Rank = "founder" | "operator" | "manager" | "multi" | "portfolio";

export type OwnerProfile = {
  ownerReputation: number;   // 0–100, accumulates across runs
  rank: Rank;
  runsStarted: number;
  runsCompleted: number;
  bestProfit: number;
  bestDay: number;
};

export const DEFAULT_OWNER: OwnerProfile = {
  ownerReputation: 30, rank: "founder", runsStarted: 0, runsCompleted: 0, bestProfit: 0, bestDay: 0,
};

/* ---------------- tunable thresholds ---------------- */

export const THRESHOLDS = {
  operator: { days: 90, cumulativeProfit: 1, businessReputation: 40, acumen: 40, decisions: 3 },
  manager:  { businessReputation: 65, acumen: 65, managerHired: true, daysAfterHire: 30 },
  secondSmallCafe: { ownerReputation: 55, acumen: 55, businessReputation: 60, profitableMonths: 3 },
  multi:    { businesses: 2, ownerReputation: 70, acumen: 70 },
  portfolio:{ businesses: 3, ownerReputation: 80, acumen: 80 },
} as const;

export const RANK_LABEL: Record<Rank, string> = {
  founder: "Founder", operator: "Operator", manager: "Manager",
  multi: "Multi-business Owner", portfolio: "Portfolio Manager",
};

export const RANK_BLURB: Record<Rank, string> = {
  founder: "Build your first business and make it stand up.",
  operator: "Run it consistently, not just survive it.",
  manager: "Run it through other people instead of doing everything.",
  multi: "Keep more than one business healthy at once.",
  portfolio: "Decide where money, people and attention should go.",
};

const RANK_ORDER: Rank[] = ["founder", "operator", "manager", "multi", "portfolio"];
export const rankIndex = (r: Rank) => Math.max(0, RANK_ORDER.indexOf(r));
export const atLeast = (have: Rank, need: Rank) => rankIndex(have) >= rankIndex(need);

/* ---------------- capital and format ---------------- */

export type Gate = { value: number; label: string; rank: Rank; ownerReputation?: number; acumen?: number };

/**
 * Capital progression is an owner-level reward, not a current-business metric.
 * Once a player reaches a rank, all capital tiers assigned to that rank and
 * every lower tier remain available on future runs.
 *
 * Agreed ladder:
 *   Founder  -> ₹5L, ₹10L
 *   Operator -> ₹20L, ₹35L
 *   Manager  -> ₹50L
 *
 * Do not use current-run Acumen or current-business state to lock these tiers.
 */
export const CAPITAL_GATES: Gate[] = [
  { value: 500000,  label: "₹5L",  rank: "founder" },
  { value: 1000000, label: "₹10L", rank: "founder" },
  { value: 2000000, label: "₹20L", rank: "operator" },
  { value: 3500000, label: "₹35L", rank: "operator" },
  { value: 5000000, label: "₹50L", rank: "manager" },
];

export const FORMAT_GATES: Array<{ id: string; rank: Rank; ownerReputation?: number }> = [
  { id: "takeaway",   rank: "founder" },
  { id: "small-cafe", rank: "founder" },
  { id: "full-cafe",  rank: "operator", ownerReputation: 50 },
];

export type LockCheck = { unlocked: boolean; reason?: string };

export function checkGate(gate: { rank: Rank; ownerReputation?: number; acumen?: number }, owner: OwnerProfile, acumen: number): LockCheck {
  if (!atLeast(owner.rank, gate.rank)) {
    return { unlocked: false, reason: `Reach ${RANK_LABEL[gate.rank]}` };
  }
  if (gate.ownerReputation !== undefined && owner.ownerReputation < gate.ownerReputation) {
    return { unlocked: false, reason: `Standing ${Math.round(owner.ownerReputation)}/${gate.ownerReputation}` };
  }
  if (gate.acumen !== undefined && acumen < gate.acumen) {
    return { unlocked: false, reason: `Acumen ${acumen}/${gate.acumen}` };
  }
  return { unlocked: true };
}

/* ---------------- earning it ---------------- */

export type RunOutcome = {
  daysSurvived: number;
  cumulativeProfit: number;
  businessReputation: number;
  acumen: number;
  bankrupt: boolean;
  completedYear: boolean;
  managerHired: boolean;
  decisionsMade: number;
};

/**
 * Standing moves with results, not with money. Finishing well raises it a lot;
 * going bust costs real ground — but never everything, because you learned
 * something even from that.
 */
export function updateOwnerReputation(owner: OwnerProfile, run: RunOutcome): number {
  let rep = owner.ownerReputation;
  if (run.completedYear && run.cumulativeProfit > 0) rep += 18;
  else if (run.completedYear) rep += 7;
  else if (run.bankrupt) rep -= 9;
  else if (run.daysSurvived >= 90 && run.cumulativeProfit > 0) rep += 6;
  else if (run.daysSurvived >= 90) rep += 2;
  if (run.businessReputation >= 70) rep += 3;
  if (run.cumulativeProfit > 2000000) rep += 4;
  if (rep > owner.ownerReputation) {
    const gain = rep - owner.ownerReputation;
    const damping = owner.ownerReputation >= 80 ? 0.35 : owner.ownerReputation >= 65 ? 0.55 : owner.ownerReputation >= 50 ? 0.75 : 1;
    rep = owner.ownerReputation + gain * damping;
  }
  return Math.max(5, Math.min(100, Math.round(rep * 10) / 10));
}

export type RankRequirement = { label: string; met: boolean };

export function rankProgress(owner: OwnerProfile, run: Partial<RunOutcome>): { next: Rank | null; requirements: RankRequirement[]; percent: number } {
  const t = THRESHOLDS;
  if (owner.rank === "founder") {
    const reqs: RankRequirement[] = [
      { label: `Run a business for ${t.operator.days} days`, met: (run.daysSurvived ?? 0) >= t.operator.days },
      { label: "Finish those months in profit", met: (run.cumulativeProfit ?? 0) > 0 },
      { label: `Business reputation ${t.operator.businessReputation}`, met: (run.businessReputation ?? 0) >= t.operator.businessReputation },
      { label: `Business acumen ${t.operator.acumen}`, met: (run.acumen ?? 0) >= t.operator.acumen },
    ];
    return { next: "operator", requirements: reqs, percent: pct(reqs) };
  }
  if (owner.rank === "operator") {
    const reqs: RankRequirement[] = [
      { label: "Hire a manager", met: Boolean(run.managerHired) },
      { label: `Business reputation ${t.manager.businessReputation}`, met: (run.businessReputation ?? 0) >= t.manager.businessReputation },
      { label: `Business acumen ${t.manager.acumen}`, met: (run.acumen ?? 0) >= t.manager.acumen },
      { label: "Keep it running well after delegating", met: Boolean(run.managerHired) && (run.businessReputation ?? 0) >= t.manager.businessReputation },
    ];
    return { next: "manager", requirements: reqs, percent: pct(reqs) };
  }
  if (owner.rank === "manager") {
    const reqs: RankRequirement[] = [
      { label: "Run two businesses at once", met: false },
      { label: `Standing ${t.multi.ownerReputation}`, met: owner.ownerReputation >= t.multi.ownerReputation },
      { label: `Business acumen ${t.multi.acumen}`, met: (run.acumen ?? 0) >= t.multi.acumen },
    ];
    return { next: "multi", requirements: reqs, percent: pct(reqs) };
  }
  if (owner.rank === "multi") {
    const reqs: RankRequirement[] = [
      { label: "Three businesses running", met: false },
      { label: `Standing ${t.portfolio.ownerReputation}`, met: owner.ownerReputation >= t.portfolio.ownerReputation },
      { label: `Business acumen ${t.portfolio.acumen}`, met: (run.acumen ?? 0) >= t.portfolio.acumen },
    ];
    return { next: "portfolio", requirements: reqs, percent: pct(reqs) };
  }
  return { next: null, requirements: [], percent: 100 };
}

function pct(reqs: RankRequirement[]): number {
  if (!reqs.length) return 0;
  return Math.round((reqs.filter(r => r.met).length / reqs.length) * 100);
}

/** Has this run earned the next rank? Checked when a run ends or passes a gate. */
export function earnedRank(owner: OwnerProfile, run: RunOutcome): Rank {
  const t = THRESHOLDS;
  if (owner.rank === "founder"
    && run.daysSurvived >= t.operator.days
    && run.cumulativeProfit >= t.operator.cumulativeProfit
    && run.businessReputation >= t.operator.businessReputation
    && run.acumen >= t.operator.acumen
    && run.decisionsMade >= t.operator.decisions
    && !run.bankrupt) return "operator";

  if (owner.rank === "operator"
    && run.managerHired
    && run.businessReputation >= t.manager.businessReputation
    && run.acumen >= t.manager.acumen
    && !run.bankrupt) return "manager";

  return owner.rank;
}
