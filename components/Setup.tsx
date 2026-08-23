"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { CapitalArt, LocationArt, FormatArt, FoodIcon } from "./Art";
import MuteButton from "./MuteButton";
import { CAPITAL_OPTIONS, CAPITAL_NOTES } from "@/lib/capital";
import { CAPITAL_GATES, FORMAT_GATES, checkGate, DEFAULT_OWNER, type OwnerProfile } from "@/lib/progression";
import { ROLES, OWNER_ROLES, crewCost, crewCapacity, crewQuality, crewStaffLevel, crewVerdict, suggestedCrew, type Crew, type OwnerRole } from "@/lib/crew";
import { FORMAT_OPTIONS, LOCATION_OPTIONS, MENU_ITEMS, formatINR,
  type BusinessFormat, type GameState, type Location, type MenuItemId } from "@/lib/simulation";

type Step = "capital" | "location" | "format" | "menu" | "crew" | "plan";
const STEPS: Step[] = ["capital", "location", "format", "menu", "crew", "plan"];
const GROUPS: Array<{ id: string; label: string; ids: MenuItemId[] }> = [
  { id: "drinks", label: "Drinks", ids: ["filter-coffee","instant-coffee","masala-chai","lemon-tea","espresso","cappuccino","cold-coffee","milkshake"] },
  { id: "food", label: "Food & snacks", ids: ["bun-maska","butter-toast","samosa","vada-pav","veg-sandwich","poha-upma","grilled-sandwich","fries"] },
  { id: "meals", label: "Meals & desserts", ids: ["pasta","rice-meal","biryani","paneer-main","dessert"] },
];

export default function Setup({ cafeName, onOpen, onBack, busy, error, owner = DEFAULT_OWNER, acumen = 0 }: {
  cafeName: string; busy: boolean; error: string; owner?: OwnerProfile; acumen?: number;
  onBack: () => void;
  onOpen: (cfg: { capital: number; location: Location; format: BusinessFormat; menu: MenuItemId[]; crew: Crew; ownerRole: OwnerRole; crewWage: number; crewCapacity: number; crewQuality: number; crewStaff: number; hiringCost: number }) => void;
}) {
  const [step, setStep] = useState<Step>("capital");
  const [capital, setCapital] = useState(1000000);
  useEffect(() => {
    const allowed = CAPITAL_OPTIONS.filter(v => { const g = CAPITAL_GATES.find(x => x.value === v); return !g || checkGate(g, owner, acumen).unlocked; });
    if (!allowed.includes(capital as typeof CAPITAL_OPTIONS[number]) && allowed.length) setCapital(allowed[allowed.length - 1]);
    /* eslint-disable-next-line */
  }, [owner.rank, owner.ownerReputation]);
  const [location, setLocation] = useState<Location>("high-footfall");
  const [format, setFormat] = useState<BusinessFormat>("small-cafe");
  const [menu, setMenu] = useState<MenuItemId[]>(["filter-coffee","masala-chai","bun-maska","vada-pav"]);
  const [open, setOpen] = useState<string>("drinks");
  const [crew, setCrew] = useState<Crew>({});
  const [ownerRole, setOwnerRole] = useState<OwnerRole>("balanced");
  const touchedCrew = useRef(false);

  const supports = (id: MenuItemId) => {
    const item = MENU_ITEMS.find(x => x.id === id)!;
    if (item.infrastructure === "kitchen") return format === "full-cafe";
    if (item.infrastructure === "beverage") return format !== "takeaway";
    return true;
  };
  useEffect(() => { setMenu(m => m.filter(supports)); /* eslint-disable-next-line */ }, [format]);

  const fmt = FORMAT_OPTIONS.find(x => x.id === format)!;
  const menuCost = useMemo(() => menu.reduce((s, id) => s + (MENU_ITEMS.find(x => x.id === id)?.setupCost ?? 0), 0), [menu]);
  const perItemOverhead = 15000;
  const kitchenSetup = Math.max(30000, menu.length * perItemOverhead);
  const setupCost = fmt.cost + menuCost + 50000 + kitchenSetup;
  const needsKitchen = menu.some(id => MENU_ITEMS.find(x => x.id === id)?.infrastructure === "kitchen");
  useEffect(() => {
    if (touchedCrew.current) return;
    setCrew(suggestedCrew(format, needsKitchen));
    /* eslint-disable-next-line */
  }, [format, needsKitchen]);
  const wages = crewCost(crew);
  const capacity = crewCapacity(crew, ownerRole, format);
  const quality = crewQuality(crew, ownerRole);
  const verdict = crewVerdict(crew, ownerRole, format, menu.length, needsKitchen);
  const remaining = capital - setupCost - wages.hiringCost;
  const idx = STEPS.indexOf(step);
  // Draw the eye to the budget bar whenever the numbers move.
  const [bump, setBump] = useState(false);
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setBump(true);
    const t = setTimeout(() => setBump(false), 620);
    return () => clearTimeout(t);
  }, [setupCost, capital]);

  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, idx + 1)]);
  const back = () => (idx === 0 ? onBack() : setStep(STEPS[idx - 1]));

  return (
    <main className="shell">
      <MuteButton />
      <div className="wrap narrow-flow">
        <div className={`budget-bar ${bump ? "bump" : ""}`}>
          <button className="back-chip" onClick={back} aria-label="Back">←</button>
          <div className={`budget-nums ${idx === 0 ? "solo" : ""}`}>
            <div><span>Capital</span><strong>{formatINR(capital)}</strong></div>
            {idx === 1 && (
              <div><span>Rent</span><strong>{formatINR(LOCATION_OPTIONS.find(x => x.id === location)?.rentMonthly ?? 0)}/mo</strong></div>
            )}
            {idx >= 2 && <>
              <div><span>Spent</span><strong>{formatINR(setupCost)}</strong></div>
              <div><span>Left</span><strong className={remaining < 0 ? "neg" : "pos"}>{formatINR(remaining)}</strong></div>
            </>}
            {idx === 0 && <div className="budget-hint"><span>To spend</span><strong>Nothing yet</strong></div>}
          </div>
        </div>
        <div className="pips">{STEPS.map((s, i) => <i key={s} className={i <= idx ? "on" : ""} />)}</div>

        <section className="card flow-card">
          <div className="flow-scroll">
          {step === "capital" && <>
            <div className="eyebrow">Step 1 of 6</div>
            <h1>How much money do you have?</h1>
            <p>Building the cafe costs money. Whatever is left over pays the bills until you start earning.</p>
            <CapitalArt level={CAPITAL_OPTIONS.indexOf(capital as typeof CAPITAL_OPTIONS[number])} />
            <div className="stack">
              {CAPITAL_OPTIONS.map(v => {
                const gate = CAPITAL_GATES.find(g => g.value === v);
                const lock = gate ? checkGate(gate, owner, acumen) : { unlocked: true };
                return (
                  <button key={v} className={`choice-card row ${capital === v ? "selected" : ""} ${lock.unlocked ? "" : "locked"}`}
                    disabled={!lock.unlocked} onClick={() => lock.unlocked && setCapital(v)}>
                    <div>
                      <strong>{formatINR(v)}</strong>
                      <small>{lock.unlocked ? CAPITAL_NOTES[v] : `Nobody will lend you this yet. ${lock.reason}.`}</small>
                    </div>
                    {capital === v && lock.unlocked && <span className="tick">✓</span>}
                    {!lock.unlocked && <span className="lock-chip">Locked</span>}
                  </button>
                );
              })}
            </div>
          </>}

          {step === "location" && <>
            <div className="eyebrow">Step 2 of 6</div>
            <h1>Where will it be?</h1>
            <p>Busy streets bring more people but cost more rent. Rent is due every month, good day or bad.</p>
            <div className="stack">
              {LOCATION_OPTIONS.map(o => (
                <button key={o.id} className={`choice-card art-row ${location === o.id ? "selected" : ""}`} onClick={() => setLocation(o.id)}>
                  <LocationArt id={o.id} />
                  <div className="art-row-text">
                    <div className="choice-head"><strong>{o.name}</strong>{location === o.id && <span className="tick">✓</span>}</div>
                    <small>{o.description}</small>
                    <em>{formatINR(o.rentMonthly)} / month</em>
                  </div>
                </button>
              ))}
            </div>
          </>}

          {step === "format" && <>
            <div className="eyebrow">Step 3 of 6</div>
            <h1>What kind of place?</h1>
            <p>Bigger places serve more people and can cook more things. They also cost more to build.</p>
            <div className="stack">
              {FORMAT_OPTIONS.map(o => {
                const gate = FORMAT_GATES.find(g => g.id === o.id);
                const lock = gate ? checkGate(gate, owner, acumen) : { unlocked: true };
                return (
                <button key={o.id} className={`choice-card art-row ${format === o.id ? "selected" : ""} ${lock.unlocked ? "" : "locked"}`}
                  disabled={!lock.unlocked} onClick={() => lock.unlocked && setFormat(o.id)}>
                  <FormatArt id={o.id} />
                  <div className="art-row-text">
                    <div className="choice-head"><strong>{o.name}</strong>{format === o.id && lock.unlocked && <span className="tick">✓</span>}{!lock.unlocked && <span className="lock-chip">Locked</span>}</div>
                    <small>{lock.unlocked ? o.description : `You have not shown you can run one of these yet. ${lock.reason}.`}</small>
                    <em>{formatINR(o.cost)} to build · up to {o.capacity} people/day</em>
                  </div>
                </button>
                );
              })}
            </div>
          </>}

          {step === "menu" && <>
            <div className="eyebrow">Step 4 of 6</div>
            <h1>What will you sell?</h1>
            <p>Each item costs money to start and to keep making. Pick a few to begin. You have {menu.length}.</p>
            <div className="groups">
              {GROUPS.map(g => {
                const avail = g.ids.filter(supports).length;
                const picked = g.ids.filter(id => menu.includes(id)).length;
                const isOpen = open === g.id;
                return (
                  <div key={g.id} className={`group ${isOpen ? "open" : ""}`}>
                    <button className="group-head" onClick={() => setOpen(isOpen ? "" : g.id)} aria-expanded={isOpen}>
                      <strong>{g.label}</strong>
                      <span className="group-meta">{picked > 0 ? `${picked} chosen` : `${avail} available`}<i className="chev">{isOpen ? "▲" : "▼"}</i></span>
                    </button>
                    {isOpen && <div className="group-body">
                      {g.ids.map(id => {
                        const item = MENU_ITEMS.find(x => x.id === id)!;
                        const ok = supports(id); const on = menu.includes(id);
                        return (
                          <button key={id} className={`menu-item ${on ? "selected" : ""} ${!ok ? "locked" : ""}`} disabled={!ok}
                            onClick={() => setMenu(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id])}>
                            <FoodIcon id={id} />
                            <div className="mi-text">
                              <strong>{item.name}</strong>
                              <small>{ok ? `${formatINR(item.setupCost + perItemOverhead)} to add · ${formatINR(item.weeklyCost)}/week`
                                : item.infrastructure === "kitchen" ? "Needs a full kitchen" : "Needs a cafe or restaurant"}</small>
                            </div>
                            {on && <span className="tick">✓</span>}
                          </button>
                        );
                      })}
                    </div>}
                  </div>
                );
              })}
            </div>
          </>}

          {step === "crew" && <>
            <div className="eyebrow">Step 5 of 6</div>
            <h1>Who is opening with you?</h1>
            <p>Every person serves more customers and costs money every day, busy or not.</p>

            <div className="ledger-head">Your part in it</div>
            <div className="stack">
              {OWNER_ROLES.map(o => (
                <button key={o.id} className={`choice-card ${ownerRole === o.id ? "selected" : ""}`}
                  onClick={() => { touchedCrew.current = true; setOwnerRole(o.id); }}>
                  <div className="choice-head"><strong>{o.name}</strong>{ownerRole === o.id && <span className="tick">✓</span>}</div>
                  <small>{o.blurb}</small>
                  <em className="crew-note">{o.note}</em>
                </button>
              ))}
            </div>

            <div className="ledger-head">Who you are hiring</div>
            <div className="stack">
              {ROLES.filter(r => r.id !== "manager").map(r => {
                const n = crew[r.id] ?? 0;
                const blocked = r.requiresKitchen && format === "takeaway";
                return (
                  <div className={`crew-row ${blocked ? "locked" : ""}`} key={r.id}>
                    <div className="crew-text">
                      <strong>{r.name}</strong>
                      <small>{blocked ? "A kiosk has no kitchen." : r.blurb}</small>
                      <em>{formatINR(r.dailyWage)}/day · serves about {r.capacity} more</em>
                    </div>
                    <div className="crew-count">
                      <button disabled={n === 0 || blocked} onClick={() => { touchedCrew.current = true; setCrew(c => ({ ...c, [r.id]: Math.max(0, n - 1) })); }}>−</button>
                      <b>{n}</b>
                      <button disabled={n >= r.max || blocked} onClick={() => { touchedCrew.current = true; setCrew(c => ({ ...c, [r.id]: Math.min(r.max, n + 1) })); }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`crew-verdict ${verdict.tone}`}>{verdict.message}</div>
            <div className="plan-rows">
              <div><span>Can serve</span><strong>{capacity} people a day</strong></div>
              <div><span>Wages</span><strong>{formatINR(wages.dailyWage)} a day</strong></div>
              <div><span>Hiring them costs</span><strong>{formatINR(wages.hiringCost)} once</strong></div>
            </div>
          </>}

          {step === "plan" && <>
            <div className="eyebrow">Step 6 of 6</div>
            <h1>{cafeName} is ready.</h1>
            <p>Here is what you have built. Happy with it?</p>
            <div className="plan-hero"><FormatArt id={format} /></div>
            <div className="plan-rows">
              <div><span>Location</span><strong>{LOCATION_OPTIONS.find(x => x.id === location)?.name}</strong></div>
              <div><span>Format</span><strong>{fmt.name}</strong></div>
              <div><span>Menu</span><strong>{menu.length} items</strong></div>
              <div><span>Crew</span><strong>{wages.headcount === 0 ? "Just you" : `${wages.headcount} staff · ${formatINR(wages.dailyWage)}/day`}</strong></div>
              <div><span>Building the place</span><strong>{formatINR(fmt.cost + 50000)}</strong></div>
              <div><span>Menu &amp; equipment</span><strong>{formatINR(menuCost + kitchenSetup)}</strong></div>
              <div><span>Setup cost</span><strong>{formatINR(setupCost)}</strong></div>
              <div><span>Monthly rent</span><strong>{formatINR(LOCATION_OPTIONS.find(x => x.id === location)?.rentMonthly ?? 0)}</strong></div>
              <div><span>Working cash</span><strong className={remaining <= 0 ? "neg" : "pos"}>{formatINR(remaining)}</strong></div>
            </div>
            {remaining <= 0 && <div className="notice">You&rsquo;re over budget by {formatINR(Math.abs(remaining))}. Go back and trim the menu, or start with more capital.</div>}
            {menu.length === 0 && <div className="notice">Pick at least one thing to sell.</div>}
          </>}

          </div>
          {error && <div className="notice">{error}</div>}

          {step === "plan"
            ? <button className="primary" disabled={busy || remaining <= 0 || menu.length === 0} onClick={() => onOpen({ capital, location, format, menu, crew, ownerRole, crewWage: wages.dailyWage, crewCapacity: capacity, crewQuality: quality, crewStaff: crewStaffLevel(crew, ownerRole), hiringCost: wages.hiringCost })}>{busy ? "Opening…" : "Unlock the door"}</button>
            : <button className="primary" disabled={(step === "menu" && menu.length === 0) || (step === "crew" && verdict.tone === "thin")} onClick={next}>Continue</button>}
        </section>
      </div>
    </main>
  );
}
