"use client";
import { useMemo, useState, useEffect } from "react";
import { CapitalArt, LocationArt, FormatArt, FoodIcon } from "./Art";
import { CAPITAL_OPTIONS, CAPITAL_NOTES } from "@/lib/capital";
import { FORMAT_OPTIONS, LOCATION_OPTIONS, MENU_ITEMS, formatINR,
  type BusinessFormat, type GameState, type Location, type MenuItemId } from "@/lib/simulation";

type Step = "capital" | "location" | "format" | "menu" | "plan";
const STEPS: Step[] = ["capital", "location", "format", "menu", "plan"];
const GROUPS: Array<{ id: string; label: string; ids: MenuItemId[] }> = [
  { id: "drinks", label: "Drinks", ids: ["filter-coffee","instant-coffee","masala-chai","lemon-tea","espresso","cappuccino","cold-coffee","milkshake"] },
  { id: "food", label: "Food & snacks", ids: ["bun-maska","butter-toast","samosa","vada-pav","veg-sandwich","poha-upma","grilled-sandwich","fries"] },
  { id: "meals", label: "Meals & desserts", ids: ["pasta","rice-meal","biryani","paneer-main","dessert"] },
];

export default function Setup({ cafeName, onOpen, onBack, busy, error }: {
  cafeName: string; busy: boolean; error: string;
  onBack: () => void;
  onOpen: (cfg: { capital: number; location: Location; format: BusinessFormat; menu: MenuItemId[] }) => void;
}) {
  const [step, setStep] = useState<Step>("capital");
  const [capital, setCapital] = useState(1000000);
  const [location, setLocation] = useState<Location>("high-footfall");
  const [format, setFormat] = useState<BusinessFormat>("small-cafe");
  const [menu, setMenu] = useState<MenuItemId[]>(["filter-coffee","masala-chai","bun-maska","vada-pav"]);
  const [open, setOpen] = useState<string>("drinks");

  const supports = (id: MenuItemId) => {
    const item = MENU_ITEMS.find(x => x.id === id)!;
    if (item.infrastructure === "kitchen") return format === "full-cafe";
    if (item.infrastructure === "beverage") return format !== "takeaway";
    return true;
  };
  useEffect(() => { setMenu(m => m.filter(supports)); /* eslint-disable-next-line */ }, [format]);

  const fmt = FORMAT_OPTIONS.find(x => x.id === format)!;
  const menuCost = useMemo(() => menu.reduce((s, id) => s + (MENU_ITEMS.find(x => x.id === id)?.setupCost ?? 0), 0), [menu]);
  const setupCost = fmt.cost + menuCost + 50000 + Math.max(30000, menu.length * 15000);
  const remaining = capital - setupCost;
  const idx = STEPS.indexOf(step);

  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, idx + 1)]);
  const back = () => (idx === 0 ? onBack() : setStep(STEPS[idx - 1]));

  return (
    <main className="shell">
      <div className="wrap narrow-flow">
        <div className="budget-bar">
          <button className="back-chip" onClick={back} aria-label="Back">←</button>
          <div className="budget-nums">
            <div><span>Capital</span><strong>{formatINR(capital)}</strong></div>
            <div><span>Spent</span><strong>{formatINR(setupCost)}</strong></div>
            <div><span>Left</span><strong className={remaining < 0 ? "neg" : "pos"}>{formatINR(remaining)}</strong></div>
          </div>
        </div>
        <div className="pips">{STEPS.map((s, i) => <i key={s} className={i <= idx ? "on" : ""} />)}</div>

        <section className="card flow-card">
          <div className="flow-scroll">
          {step === "capital" && <>
            <div className="eyebrow">Step 1 of 5</div>
            <h1>How much are you putting in?</h1>
            <p>This is your everything. Setup comes out of it — what&rsquo;s left keeps you alive.</p>
            <CapitalArt level={CAPITAL_OPTIONS.indexOf(capital as typeof CAPITAL_OPTIONS[number])} />
            <div className="stack">
              {CAPITAL_OPTIONS.map(v => (
                <button key={v} className={`choice-card row ${capital === v ? "selected" : ""}`} onClick={() => setCapital(v)}>
                  <div><strong>{formatINR(v)}</strong><small>{CAPITAL_NOTES[v]}</small></div>
                  {capital === v && <span className="tick">✓</span>}
                </button>
              ))}
            </div>
          </>}

          {step === "location" && <>
            <div className="eyebrow">Step 2 of 5</div>
            <h1>Where are you opening?</h1>
            <p>Rent is monthly, and it never stops. Busier streets cost more and expect more.</p>
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
            <div className="eyebrow">Step 3 of 5</div>
            <h1>What are you building?</h1>
            <p>This sets how many people you can serve a day — and what you&rsquo;re allowed to cook.</p>
            <div className="stack">
              {FORMAT_OPTIONS.map(o => (
                <button key={o.id} className={`choice-card art-row ${format === o.id ? "selected" : ""}`} onClick={() => setFormat(o.id)}>
                  <FormatArt id={o.id} />
                  <div className="art-row-text">
                    <div className="choice-head"><strong>{o.name}</strong>{format === o.id && <span className="tick">✓</span>}</div>
                    <small>{o.description}</small>
                    <em>{formatINR(o.cost)} to build · up to {o.capacity} people/day</em>
                  </div>
                </button>
              ))}
            </div>
          </>}

          {step === "menu" && <>
            <div className="eyebrow">Step 4 of 5</div>
            <h1>What are you selling?</h1>
            <p>Every item costs money to set up and to run each week. {menu.length} chosen so far.</p>
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
                              <small>{ok ? `${formatINR(item.setupCost)} setup · ${formatINR(item.weeklyCost)}/week`
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

          {step === "plan" && <>
            <div className="eyebrow">Step 5 of 5</div>
            <h1>{cafeName} is ready.</h1>
            <p>Last look before you unlock the door.</p>
            <div className="plan-hero"><FormatArt id={format} /></div>
            <div className="plan-rows">
              <div><span>Location</span><strong>{LOCATION_OPTIONS.find(x => x.id === location)?.name}</strong></div>
              <div><span>Format</span><strong>{fmt.name}</strong></div>
              <div><span>Menu</span><strong>{menu.length} items</strong></div>
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
            ? <button className="primary" disabled={busy || remaining <= 0 || menu.length === 0} onClick={() => onOpen({ capital, location, format, menu })}>{busy ? "Opening…" : "Unlock the door"}</button>
            : <button className="primary" disabled={step === "menu" && menu.length === 0} onClick={next}>Continue</button>}
        </section>
      </div>
    </main>
  );
}
