import type { GameEventId, GameState } from "./simulation";
import { crewCapacity, crewStaffLevel, type Crew, type OwnerRole, type RoleId } from "./crew";

export type OperationalEffect = {
  id: string;
  sourceDay: number;
  applyOnDay: number;
  label: string;
  crewRole?: RoleId;
  crewDelta?: number;
  staffDelta?: number;
  capacityDelta?: number;
  qualityDelta?: number;
  reputationDelta?: number;
  cashDelta?: number;
};

type MutableState = GameState & { operationalEffects?: OperationalEffect[] };

function roleCount(crew: Crew, role: RoleId) {
  return Math.max(0, crew[role] ?? 0);
}

function removeOne(crew: Crew, preferred: RoleId[]): { crew: Crew; role: RoleId | null } {
  const next = { ...crew };
  for (const role of preferred) {
    if (roleCount(next, role) > 0) {
      next[role] = roleCount(next, role) - 1;
      return { crew: next, role };
    }
  }
  return { crew: next, role: null };
}

function addOne(crew: Crew, role: RoleId): Crew {
  return { ...crew, [role]: roleCount(crew, role) + 1 };
}

function recalcStaffing(state: MutableState, crew: Crew): MutableState {
  const owner = (state.ownerRole ?? "balanced") as OwnerRole;
  return {
    ...state,
    crew,
    crewWage: 850 * roleCount(crew, "barista") + 650 * roleCount(crew, "server") + 1100 * roleCount(crew, "cook") + 1400 * roleCount(crew, "manager"),
    serviceCapacity: crewCapacity(crew, owner, state.format),
    staff: crewStaffLevel(crew, owner),
  };
}

/**
 * Applies consequences that must change the operational business state, rather
 * than merely changing a headline stat. Event options are deliberately mapped
 * here so the event library can remain narrative while this layer owns the
 * simulation consequences.
 */
export function applyEventConsequence(state: MutableState, eventId: GameEventId, option: string): MutableState {
  let next = state;
  const crew = { ...(next.crew ?? {}) } as Crew;

  switch (eventId) {
    case "staff-poached":
      if (option === "let-them-go" || option === "take-the-counteroffer") {
        const removed = removeOne(crew, ["server", "barista", "cook", "manager"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
        next = { ...next, quality: Math.max(0, next.quality - 2), reputation: Math.max(0, next.reputation - 1) };
      }
      break;

    case "loyal-underperformer":
      if (["let-them-go", "fire-them", "terminate", "move-them"].includes(option)) {
        const removed = removeOne(crew, ["server", "barista", "cook"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
        next = { ...next, quality: Math.min(100, next.quality + 2) };
      }
      break;

    case "ageing-server":
      if (["replace-them", "let-them-go", "retire-them"].includes(option)) {
        const removed = removeOne(crew, ["server"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
      }
      break;

    case "struggling-cook":
      if (["replace-cook", "let-them-go", "fire-cook"].includes(option)) {
        const removed = removeOne(crew, ["cook"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
        next = { ...next, quality: Math.min(100, next.quality + 3) };
      }
      break;

    case "staff-raise":
      if (["grant-raise", "approve-raise", "give-raise"].includes(option)) {
        next = { ...next, crewWage: Math.round((next.crewWage ?? 0) * 1.08) };
      } else if (["refuse-raise", "deny-raise"].includes(option)) {
        next = { ...next, reputation: Math.max(0, next.reputation - 2), quality: Math.max(0, next.quality - 1) };
      }
      break;

    case "family-illness":
    case "staff-absence": {
      const leaveDays = eventId === "family-illness" ? 30 : 7;
      if (["hold-the-job", "unpaid-hold", "approve-leave", "grant-leave", "let-them-go"].includes(option)) {
        const preferred: RoleId[] = ["cook", "barista", "server", "manager"];
        const removed = removeOne(crew, preferred);
        if (removed.role) {
          next = recalcStaffing(next, removed.crew);
          const effect: OperationalEffect = {
            id: `leave-${eventId}-${next.day}`,
            sourceDay: next.day,
            applyOnDay: next.day + leaveDays,
            label: `The employee who took leave returns after ${leaveDays} days`,
            crewRole: removed.role,
            crewDelta: 1,
          };
          next.operationalEffects = [...(next.operationalEffects ?? []), effect];
          next = { ...next, quality: Math.max(0, next.quality - 2) };
        }
      } else if (["cover-shift", "temporary-cover", "hire-cover"].includes(option)) {
        next = { ...next, cash: Math.max(0, next.cash - 8000), quality: Math.max(0, next.quality - 0.5) };
      }
      break;
    }

    default:
      break;
  }

  return next;
}

export function applyOperationalEffects(state: MutableState): MutableState {
  const due = (state.operationalEffects ?? []).filter(e => e.applyOnDay <= state.day);
  if (!due.length) return state;
  let next = state;
  for (const effect of due) {
    if (effect.crewRole && effect.crewDelta) {
      const crew = { ...(next.crew ?? {}) } as Crew;
      const current = roleCount(crew, effect.crewRole);
      crew[effect.crewRole] = Math.max(0, current + effect.crewDelta);
      next = recalcStaffing(next, crew);
    }
    next = {
      ...next,
      cash: Math.max(0, next.cash + (effect.cashDelta ?? 0)),
      quality: Math.max(0, Math.min(100, next.quality + (effect.qualityDelta ?? 0))),
      reputation: Math.max(0, Math.min(100, next.reputation + (effect.reputationDelta ?? 0))),
      staff: Math.max(0, Math.min(100, next.staff + (effect.staffDelta ?? 0))),
      serviceCapacity: Math.max(20, next.serviceCapacity + (effect.capacityDelta ?? 0)),
      lastDayMessage: `${next.lastDayMessage}${next.lastDayMessage ? " " : ""}${effect.label}.`,
    };
  }
  return { ...next, operationalEffects: (next.operationalEffects ?? []).filter(e => e.applyOnDay > next.day) };
}

export function canHireCook(state: MutableState): boolean {
  return state.format === "full-cafe" || (state.investments ?? []).includes("kitchen-upgrade");
}

export function normaliseCrewForKitchen(state: MutableState): MutableState {
  if (!canHireCook(state) && (state.crew?.cook ?? 0) > 0) {
    const crew = { ...(state.crew ?? {}) } as Crew;
    delete crew.cook;
    return recalcStaffing(state, crew);
  }
  return state;
}

export function addTemporaryCrewMember(state: MutableState, role: RoleId): MutableState {
  const crew = addOne({ ...(state.crew ?? {}) } as Crew, role);
  return recalcStaffing(state, crew);
}
