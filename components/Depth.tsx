"use client";

import { useState } from "react";
import { formatINR, type GameState, type MenuItemId } from "@/lib/simulation";
import {
  MANAGER_TRAITS, SUPPLIER_TRAITS, MAX_MANAGER_TRAITS, MAX_SUPPLIER_TRAITS,
  managerSalary, supplierSummary, type ManagerTrait, type SupplierTrait,
} from "@/lib/people";
import { menuPerformance, discontinueCost } from "@/lib/menuPerformance";
import { ROLES, crewCost, crewCapacity, OWNER_ROLES, type Crew, type RoleId, type OwnerRole } from "@/lib/crew";
import { readAcumen, DIMENSION_LABEL, type Dimension } from "@/lib/acumen";
import { INVESTMENTS, availableInvestments, type InvestmentId } from "@/lib/reinvestment";

/* ---------- hiring a manager ---------- */

export function ManagerPicker({ onConfirm, onClose }: { onConfirm: (traits: ManagerTrait[]) => void; onClose: () => void }) {
  const [picked, setPicked] = useState<ManagerTrait[]>([]);
  const full = picked.length >= MAX_MANAGER_TRAITS;
  const salary = managerSalary(picked);
  return (
    <div className="backdrop pick" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="eyebrow">Hiring · ₹45,000 to bring them in</div>
        <h2>What matters most in this person?</h2>
        <p className="detail-what">
          Pick {MAX_MANAGER_TRAITS}. Nobody is everything — someone brilliant with people is rarely
          also the one watching the food, and what you leave out will show up eventually.
        </p>
        <div className="stack">
          {MANAGER_TRAITS.map(t => {
            const on = picked.includes(t.id);
            const locked = !on && full;
            return (
              <button key={t.id} className={`choice-card ${on ? "selected" : ""} ${locked ? "locked" : ""}`} disabled={locked}
                onClick={() => setPicked(p => on ? p.filter(x => x !== t.id) : [...p, t.id])}>
                <div className="choice-head"><strong>{t.label}</strong>{on && <span className="tick">✓</span>}</div>
                <small>{t.blurb}</small>
              </button>
            );
          })}
        </div>
        <div className="explain-rows">
          <div><span>Salary</span><strong>{formatINR(salary)} a day — {picked.length ? "what you asked for costs more" : "the base rate"}</strong></div>
        </div>
        <button className="primary" disabled={picked.length !== MAX_MANAGER_TRAITS} onClick={() => onConfirm(picked)}>
          {picked.length === MAX_MANAGER_TRAITS ? "Hire them" : `Choose ${MAX_MANAGER_TRAITS - picked.length} more`}
        </button>
        <button className="text-button" onClick={onClose}>Not now</button>
      </div>
    </div>
  );
}

/* ---------- signing a supplier ---------- */

export function SupplierPicker({ onConfirm, onClose }: { onConfirm: (traits: SupplierTrait[]) => void; onClose: () => void }) {
  const [picked, setPicked] = useState<SupplierTrait[]>([]);
  const full = picked.length >= MAX_SUPPLIER_TRAITS;
  return (
    <div className="backdrop pick" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="eyebrow">Supply contract · ₹35,000</div>
        <h2>What do you need from them?</h2>
        <p className="detail-what">
          Pick {MAX_SUPPLIER_TRAITS}. Good rates and good produce rarely come from the same place,
          and a supplier you have not chosen for reliability will let you down at some point.
        </p>
        <div className="stack">
          {SUPPLIER_TRAITS.map(t => {
            const on = picked.includes(t.id);
            const locked = !on && full;
            return (
              <button key={t.id} className={`choice-card ${on ? "selected" : ""} ${locked ? "locked" : ""}`} disabled={locked}
                onClick={() => setPicked(p => on ? p.filter(x => x !== t.id) : [...p, t.id])}>
                <div className="choice-head"><strong>{t.label}</strong>{on && <span className="tick">✓</span>}</div>
                <small>{t.blurb}</small>
              </button>
            );
          })}
        </div>
        {picked.length === MAX_SUPPLIER_TRAITS && (
          <div className="explain-rows"><div><span>What you are signing</span><strong>{supplierSummary(picked)}</strong></div></div>
        )}
        <button className="primary" disabled={picked.length !== MAX_SUPPLIER_TRAITS} onClick={() => onConfirm(picked)}>
          {picked.length === MAX_SUPPLIER_TRAITS ? "Sign the contract" : `Choose ${MAX_SUPPLIER_TRAITS - picked.length} more`}
        </button>
        <button className="text-button" onClick={onClose}>Not now</button>
      </div>
    </div>
  );
}

/* ---------- how the menu is doing ---------- */

export function MenuReport({ state, onDrop, onClose }: { state: GameState; onDrop?: (id: MenuItemId) => void; onClose: () => void }) {
  const [confirming, setConfirming] = useState<MenuItemId | null>(null);
  const lines = menuPerformance(state);
  const drop = confirming ? discontinueCost(state, confirming) : null;
  const dropName = lines.find(l => l.id === confirming)?.name;

  if (confirming && drop) return (
    <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && setConfirming(null)}>
      <div className="sheet">
        <div className="eyebrow">Taking it off the menu</div>
        <h2>Drop {dropName}?</h2>
        <p className="detail-what">The equipment is bought and most of it cannot be sold on. You get a little back, not the lot.</p>
        <div className="explain-rows">
          <div><span>You recover</span><strong>{formatINR(drop.recovered)}</strong></div>
          <div><span>You write off</span><strong>{formatINR(drop.writeOff)}</strong></div>
          <div><span>Reputation</span><strong>{drop.share > 0.08 ? "Regulars came for this. They will notice." : drop.share > 0.04 ? "A few people will miss it." : "Barely anyone will notice."}</strong></div>
        </div>
        <button className="primary" onClick={() => { onDrop?.(confirming); setConfirming(null); }}>Take it off</button>
        <button className="text-button" onClick={() => setConfirming(null)}>Keep it</button>
      </div>
    </div>
  );

  return (
    <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="eyebrow">The menu</div>
        <h2>What is actually selling</h2>
        <p className="detail-what">Weekly figures at your current trade. Some lines carry the place; others quietly cost you.</p>
        <div className="menu-report">
          {lines.map(l => (
            <div className={`mr-row ${l.verdict}`} key={l.id}>
              <div className="mr-top">
                <strong>{l.name}</strong>
                <span className={`mr-tag ${l.verdict}`}>{l.verdict === "star" ? "Star" : l.verdict === "drag" ? "Losing money" : l.verdict === "quiet" ? "Quiet" : "Steady"}</span>
              </div>
              <div className="mr-nums">
                <span>{Math.round(l.share * 100)}% of orders</span>
                <span className={l.weeklyProfit >= 0 ? "pos" : "neg"}>{formatINR(l.weeklyProfit)}/week</span>
              </div>
              <small>{l.note}</small>
              {onDrop && l.verdict !== "star" && (
                <button className="text-button mr-drop" onClick={() => setConfirming(l.id)}>Take it off the menu</button>
              )}
            </div>
          ))}
        </div>
        <button className="primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ---------- how the owner is doing ---------- */

export function AcumenPanel({ state, owner, journey, onClose }: { state: GameState; owner?: { rank: string; ownerReputation: number; runsCompleted: number }; journey?: { requirements: Array<{ label: string; met: boolean }>; percent: number; next: string | null } | null; onClose: () => void }) {
  const read = readAcumen(state as Parameters<typeof readAcumen>[0]);
  const dims: Dimension[] = ["finance", "operations", "people", "market", "strategy"];
  return (
    <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="eyebrow">You, as an owner</div>
        <h2>Business acumen · {read.overall}</h2>
        <p className="detail-what">
          Not what you own — how you run it. This moves with the decisions you make, not the money in the bank.
        </p>
        <div className="acu">
          {dims.map(d => (
            <div className="acu-row" key={d}>
              <span>{DIMENSION_LABEL[d]}</span>
              <div className="acu-bar"><i style={{ width: `${Math.max(3, read.scores[d])}%` }} /></div>
              <b>{read.scores[d]}</b>
            </div>
          ))}
        </div>
        <div className="explain-rows">
          <div><span>Standing as an owner</span><strong>{Math.round(owner?.ownerReputation ?? 30)} / 100{owner?.runsCompleted ? ` · ${owner.runsCompleted} run${owner.runsCompleted === 1 ? "" : "s"} finished` : ""}</strong></div>
          <div><span>What it takes next</span><strong>{read.nextRequirement}</strong></div>
        </div>
        {journey && journey.requirements.length > 0 && (
          <>
            <div className="ledger-head">Toward {journey.next ?? "the next stage"} · {journey.percent}%</div>
            <div className="req-list">
              {journey.requirements.map(r => (
                <div key={r.label} className={r.met ? "met" : ""}><i>{r.met ? "✓" : "○"}</i><span>{r.label}</span></div>
              ))}
            </div>
          </>
        )}
        {read.coaching && <p className="daymsg">{read.coaching}</p>}
        <button className="primary" onClick={onClose}>Back to the cafe</button>
      </div>
    </div>
  );
}

/* ---------- putting money back in ---------- */

export function InvestmentPicker({ state, onConfirm, onClose }: { state: GameState & { investments?: string[] }; onConfirm: (id: InvestmentId) => void; onClose: () => void }) {
  const options = availableInvestments(state);
  const owned = state.investments ?? [];
  return (
    <div className="backdrop pick" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="eyebrow">Putting money back in</div>
        <h2>What are you building?</h2>
        <p className="detail-what">Cash sitting in the bank earns nothing. Each of these changes the business — and each one asks something of you afterwards.</p>
        <div className="stack">
          {options.map(inv => {
            const tooDear = inv.cost > state.cash;
            return (
              <button key={inv.id} className={`choice-card ${tooDear ? "locked" : ""}`} disabled={tooDear} onClick={() => onConfirm(inv.id)}>
                <div className="choice-head"><strong>{inv.name}</strong><span className="dec-cost">{formatINR(inv.cost)}</span></div>
                <small>{inv.what}</small>
                <em className="inv-gain">{inv.gain}</em>
                <em className="dec-warn">{inv.responsibility}</em>
                {tooDear && <small className="warned">More than you have in the bank</small>}
              </button>
            );
          })}
          {!options.length && <p className="daymsg">Nothing new to build yet. More becomes possible as the cafe matures.</p>}
        </div>
        {owned.length > 0 && (
          <div className="explain-rows">
            <div><span>Already built</span><strong>{owned.map(id => INVESTMENTS.find(i => i.id === id)?.name).filter(Boolean).join(" · ")}</strong></div>
          </div>
        )}
        <button className="text-button" onClick={onClose}>Not now</button>
      </div>
    </div>
  );
}


/* ---------- who is on the floor ---------- */

export function CrewPanel({ state, onChange, onClose }: {
  state: GameState & { crew?: Crew; ownerRole?: OwnerRole; crewWage?: number };
  onChange?: (crew: Crew) => void;
  onClose: () => void;
}) {
  const [crew, setCrew] = useState<Crew>(state.crew ?? {});
  const [dirty, setDirty] = useState(false);
  const ownerRole = state.ownerRole ?? "balanced";
  const before = crewCost(state.crew ?? {});
  const after = crewCost(crew);
  const capacity = crewCapacity(crew, ownerRole, state.format);
  const used = state.serviceCapacity > 0 ? Math.round((state.customers / state.serviceCapacity) * 100) : 0;
  const hiring = Math.max(0, after.hiringCost - before.hiringCost);
  const owner = OWNER_ROLES.find(o => o.id === ownerRole);

  const change = (id: RoleId, delta: number) => {
    const role = ROLES.find(r => r.id === id)!;
    setCrew(c => ({ ...c, [id]: Math.max(0, Math.min(role.max, (c[id] ?? 0) + delta)) }));
    setDirty(true);
  };

  return (
    <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="eyebrow">Your crew</div>
        <h2>Manage the crew</h2>
        <p className="detail-what">
          You served {state.customers} people yesterday and can handle {state.serviceCapacity}
          {used < 60 ? " — you are paying for hands you are not using." : used > 90 ? " — you are close to turning people away." : "."}
          {owner ? ` You are ${owner.name.toLowerCase()}.` : ""}
        </p>
        <div className="stack">
          {ROLES.filter(r => r.id !== "manager").map(r => {
            const n = crew[r.id] ?? 0;
            const blocked = r.requiresKitchen && state.format === "takeaway";
            return (
              <div className={`crew-row ${blocked ? "locked" : ""}`} key={r.id}>
                <div className="crew-text">
                  <strong>{r.name}</strong>
                  <small>{blocked ? "A kiosk has no kitchen." : r.blurb}</small>
                  <em>{formatINR(r.dailyWage)}/day each</em>
                </div>
                <div className="crew-count">
                  <button disabled={n === 0 || blocked} onClick={() => change(r.id, -1)}>−</button>
                  <b>{n}</b>
                  <button disabled={n >= r.max || blocked} onClick={() => change(r.id, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="plan-rows">
          <div><span>Wages after this</span><strong>{formatINR(after.dailyWage)} a day</strong></div>
          <div><span>Would serve</span><strong>{capacity} people a day</strong></div>
          {hiring > 0 && <div><span>Hiring cost</span><strong>{formatINR(hiring)} once</strong></div>}
          {after.headcount < before.headcount && (
            <div><span>Letting {before.headcount - after.headcount} go</span><strong>No refund. Quality dips while the rest adjust, and the team notices.</strong></div>
          )}
          {after.headcount > before.headcount && (
            <div><span>Taking {after.headcount - before.headcount} on</span><strong>They need a few days to settle in before they are worth their wage.</strong></div>
          )}
        </div>
        {onChange && (
          <button className="primary" disabled={!dirty} onClick={() => onChange(crew)}>
            {dirty ? "Make these changes" : "Nothing changed"}
          </button>
        )}
        <button className="text-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
