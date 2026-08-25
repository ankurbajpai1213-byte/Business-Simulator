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

function queueReturn(state: MutableState, role: RoleId, days: number, label: string): MutableState {
  const effect: OperationalEffect = {
    id: `${role}-return-${state.day}-${days}`,
    sourceDay: state.day,
    applyOnDay: state.day + days,
    label,
    crewRole: role,
    crewDelta: 1,
  };
  return { ...state, operationalEffects: [...(state.operationalEffects ?? []), effect] };
}

/**
 * Converts event choices into changes to the actual operating model.
 *
 * `applyEvent` owns the headline metrics (cash, reputation, quality, etc.).
 * This layer owns consequences that must touch the underlying business
 * machinery: crew, capacity, payroll and temporary absences.
 */
export function applyEventConsequence(state: MutableState, eventId: GameEventId, option: string): MutableState {
  let next = state;
  const crew = { ...(next.crew ?? {}) } as Crew;

  switch (eventId) {
    case "staff-poached": {
      if (option === "match-offer-staff") {
        // The counteroffer is a real recurring cost, not just a morale boost.
        next = { ...next, crewWage: Math.round((next.crewWage ?? 0) * 1.10), staff: Math.min(100, next.staff + 4) };
      } else if (option === "let-them-go") {
        const removed = removeOne(crew, ["server", "barista", "cook", "manager"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
      }
      break;
    }

    case "staff-raise":
      if (option === "give-raise") {
        next = { ...next, crewWage: Math.round((next.crewWage ?? 0) * 1.08) };
      }
      break;

    case "struggling-cook":
      if (option === "replace-cook") {
        const removed = removeOne(crew, ["cook"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
      } else if (option === "second-cook") {
        next = recalcStaffing(next, addOne(crew, "cook"));
      } else if (option === "give-time-off") {
        const removed = removeOne(crew, ["cook"]);
        if (removed.role) {
          next = recalcStaffing(next, removed.crew);
          next = queueReturn(next, removed.role, 14, "Your cook has returned after the two weeks of paid leave");
        }
      }
      break;

    case "ageing-server":
      if (option === "let-him-go") {
        const removed = removeOne(crew, ["server"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
      } else if (option === "quieter-shifts") {
        next = { ...next, capacityDelta: undefined, quality: Math.max(0, next.quality - 1) };
      } else if (option === "keep-as-is") {
        next = { ...next, quality: Math.max(0, next.quality - 2) };
      }
      break;

    case "family-illness": {
      const preferred: RoleId[] = ["cook", "server", "barista", "manager"];
      if (option === "hold-the-job" || option === "unpaid-hold") {
        const removed = removeOne(crew, preferred);
        if (removed.role) {
          next = recalcStaffing(next, removed.crew);
          next = queueReturn(next, removed.role, 30, "The employee who took family leave has returned to the team");
          if (option === "hold-the-job") {
            next = { ...next, cash: Math.max(0, next.cash - 14000) };
          }
        }
      } else if (option === "fill-position") {
        // A replacement keeps the operating headcount intact, but is less settled.
        const removed = removeOne(crew, preferred);
        if (removed.role) {
          next = recalcStaffing(next, addOne(removed.crew, removed.role));
          next = { ...next, quality: Math.max(0, next.quality - 1.5) };
        }
      }
      break;
    }

    case "loyal-underperformer":
      if (option === "train-them") {
        next = { ...next, quality: Math.min(100, next.quality + 2), staff: Math.min(100, next.staff + 2) };
      } else if (option === "move-them") {
        next = { ...next, serviceCapacity: Math.max(20, next.serviceCapacity - 10), quality: Math.min(100, next.quality + 1) };
      } else if (option === "let-them-go-loyal") {
        const removed = removeOne(crew, ["server", "barista", "cook"]);
        if (removed.role) next = recalcStaffing(next, removed.crew);
      }
      break;

    // These choices alter the operating conditions beyond a single headline stat.
    case "water-shortage":
      if (option === "limited-menu") next = { ...next, serviceCapacity: Math.max(20, Math.round(next.serviceCapacity * 0.75)) };
      break;

    case "festival-rush":
      if (option === "stock-up-festival") next = { ...next, serviceCapacity: Math.min(600, next.serviceCapacity + 15) };
      break;

    case "catering-enquiry":
      if (option === "take-catering") next = { ...next, quality: Math.max(0, next.quality - 1) };
      break;

    case "rival-closes":
      if (option === "hire-their-staff") {
        // Hiring is deliberately represented as a real crew member rather than only staff points.
        next = recalcStaffing(next, addOne(crew, "barista"));
      }
      break;

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
