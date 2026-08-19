"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CAPITAL_CAPTIONS, CAPITAL_OPTIONS } from "@/lib/capital";
import { FORMAT_OPTIONS, LOCATION_OPTIONS, MENU_ITEMS, formatINR, getAvailableDecisions, type BusinessFormat, type Decision, type GameState, type Location, type MenuItemId } from "@/lib/simulation";

const DECISIONS: Array<[Decision, string, string]> = [
  ["raise-price", "Raise prices", "Protect your margin, but customers may push back."],
  ["marketing", "Run marketing", "Spend ₹10,000 to bring more people through the door."],
  ["hire", "Hire staff", "Spend ₹18,000 to improve service capacity."],
  ["quality", "Improve quality", "Spend ₹12,000 to improve the product and experience."],
  ["inventory", "Restock", "Spend ₹8,000 to protect yourself from stock shortages."],
];
const decisionName = (id: Decision) => DECISIONS.find(x => x[0] === id)?.[1] ?? "Business decision";

export default function Home() {
  const [player, setPlayer] = useState<{ id: string; display_name: string } | null>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [eventOption, setEventOption] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ day: number; title: string; message: string } | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const load = async () => {
    try {
      const p = await fetch("/api/player"); const pd = await p.json();
      if (!pd.player) return;
      setPlayer(pd.player);
      const r = await fetch("/api/game/session"); const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to start game.");
      setState(d.state as GameState);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load the game."); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!state?.setupComplete) return;
    const lastPrompt = Number(localStorage.getItem("business-sim-feedback-day") || 0);
    if (state.day >= 3 && state.day >= lastPrompt + 3 && !feedbackSent) setFeedbackOpen(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [state?.day, state?.setupComplete, feedbackSent]);

  const startPlayer = async () => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Please enter your name.");
      setPlayer(d.player);
      const s = await fetch("/api/game/session"); const sd = await s.json();
      if (!s.ok) throw new Error(sd.error || "Unable to start game.");
      setState(sd.state as GameState);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to start."); } finally { setBusy(false); }
  };

  const finishDay = async () => {
    if (!state || !selected || (state.currentEvent && !eventOption)) return;
    const completedDay = state.day; setBusy(true); setError("");
    try {
      const r = await fetch("/api/simulate-turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: selected, eventOption }) }); const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to advance the day.");
      const next = d.state as GameState; setState(next); setSelected(null); setEventOption(null);
      setCelebration({ day: completedDay, title: `Day ${completedDay} complete 🎉`, message: next.lastDayMessage || d.dayMessage || "Another day in the books. See what changed and keep going." });
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to advance the day."); } finally { setBusy(false); }
  };

  const newBusiness = async () => {
    if (!confirm("Start a new business? Your current run stays saved.")) return;
    setBusy(true); setError("");
    try { const r = await fetch("/api/game/new", { method: "POST" }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to start a new business."); setState(d.state as GameState); setSelected(null); setEventOption(null); setCelebration(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to start a new business."); } finally { setBusy(false); }
  };

  const submitFeedback = async (answers: { ease?: string; gameplay?: string; realism?: string; decisions?: string; continuePlaying?: string; comment?: string; skipped?: boolean }) => {
    if (!state) return;
    const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...answers, sessionDays: state.day }) });
    if (r.ok) { setFeedbackSent(true); setFeedbackOpen(false); localStorage.setItem("business-sim-feedback-day", String(state.day)); }
  };

  if (!player) return <NameScreen name={name} setName={setName} onStart={startPlayer} busy={busy} error={error} />;
  if (!state) return <Loading error={error} onRetry={load} />;
  if (!state.setupComplete) return <SetupScreen onComplete={s => { setState(s); setCelebration({ day: 0, title: "Congratulations! 🎉", message: "Setup complete. Let’s run it. ☕" }); }} />;
  const available = new Set(getAvailableDecisions(state)); const location = LOCATION_OPTIONS.find(x => x.id === state.location); const format = FORMAT_OPTIONS.find(x => x.id === state.format);

  return <main className="shell"><div className="container">
    <header className="topbar"><div><div className="brand">Business Simulator</div><div className="subtle">Hi {player.display_name} · {location?.name} · {format?.name}</div></div><div className="top-actions"><button className="secondary compact" onClick={() => setHistoryOpen(true)}>Past days</button><button className="secondary compact" onClick={() => setMilestonesOpen(true)}>🏆 {state.milestones.length}</button><button className="secondary compact" onClick={newBusiness} disabled={busy}>New business</button></div></header>
    <section className="hero game-hero"><div className="day-pill">DAY {state.day}</div><h1>How will you run it today?</h1><p>{state.cash <= 0 ? "The business has run out of cash." : "Make one decision. See what happens. Then do it again."}</p>{error && <div className="notice">{error}</div>}</section>
    <section className="grid metrics"><Metric label="Cash" value={formatINR(state.cash)} /><Metric label="Revenue" value={formatINR(state.revenue)} /><Metric label="Profit" value={formatINR(state.profit)} good={state.profit >= 0} /><Metric label="Customers" value={state.customers.toLocaleString("en-IN")} /><Metric label="Reputation" value={`${Math.round(state.reputation)}/100`} /></section>
    {state.currentEvent && <section className="panel event-card"><div className="eyebrow">Something happened</div><h2>{state.currentEvent.title}</h2><p>{state.currentEvent.narrative}</p><div className="actions">{state.currentEvent.options.map(o => <button key={o.id} className={`action ${eventOption === o.id ? "selected" : ""}`} onClick={() => setEventOption(o.id)} disabled={busy}><strong>{eventOption === o.id ? "✓ " : ""}{o.title}</strong><small>{o.description}{o.cost ? ` · ${formatINR(o.cost)}` : ""}</small></button>)}</div></section>}
    <section className="panel decision-card"><div className="section-head"><div><div className="eyebrow">Today’s decision</div><h2>What do you want to do?</h2></div><span className="step-count">1 choice</span></div><div className="actions">{DECISIONS.map(([id, title, description]) => <button key={id} className={`action ${selected === id ? "selected" : ""} ${!available.has(id) ? "locked" : ""}`} onClick={() => available.has(id) && setSelected(id)} disabled={busy || !available.has(id)}><strong>{selected === id ? "✓ " : ""}{title}</strong><small>{!available.has(id) ? (state.day === 1 ? "Available after your first day" : "Not the best fit for this stage") : description}</small></button>)}</div><div className="selection-line">{selected ? <>You chose <strong>{decisionName(selected)}</strong></> : "Choose the move that feels right."}</div><button className="primary" onClick={finishDay} disabled={busy || !selected || !!(state.currentEvent && !eventOption)}>{busy ? "Wrapping up…" : "Finish day →"}</button></section>
    <div className="grid lower-grid"><section className="panel"><div className="eyebrow">Your business</div><h2>Where things stand</h2><div className="market"><Row label="Service capacity" value={`${state.serviceCapacity}/day`} /><Row label="Staff" value={`${state.staff}/100`} /><Row label="Quality" value={`${state.quality}/100`} /><Row label="Inventory" value={`${Math.round(state.inventory)}/100`} /><Row label="Monthly rent" value={formatINR(location?.rentMonthly ?? 0)} /></div></section><section className="panel menu-card"><div className="eyebrow">Your menu</div><h2>What you sell</h2><div className="chip-list">{state.menu.map(id => <span key={id}>{MENU_ITEMS.find(x => x.id === id)?.name}</span>)}</div></section></div>
  </div>
  {celebration && <Modal onClose={() => setCelebration(null)}><div className="celebration"><div className="celebration-icon">✦</div><div className="eyebrow">{celebration.day === 0 ? "Your journey begins" : "A new day"}</div><h2>{celebration.title}</h2><p>{celebration.message}</p>{celebration.day > 0 && <div className="result-mini"><span>Revenue <strong>{formatINR(state.revenue)}</strong></span><span>Profit <strong className={state.profit >= 0 ? "positive" : "negative"}>{formatINR(state.profit)}</strong></span><span>Customers <strong>{state.customers}</strong></span></div>}<button className="primary" onClick={() => setCelebration(null)}>{celebration.day === 0 ? "Open Day 1 →" : "Continue →"}</button></div></Modal>}
  {historyOpen && <HistoryModal state={state} onClose={() => setHistoryOpen(false)} />}{milestonesOpen && <MilestoneModal state={state} onClose={() => setMilestonesOpen(false)} />}{feedbackOpen && !feedbackSent && <FeedbackModal onSubmit={submitFeedback} onSkip={() => submitFeedback({ skipped: true })} />}
  </main>;
}

function NameScreen({ name, setName, onStart, busy, error }: { name: string; setName: (v: string) => void; onStart: () => void; busy: boolean; error: string }) { return <main className="shell"><div className="container loading"><div className="brand">Business Simulator</div><div className="hero"><div className="day-pill">WELCOME</div><h1>What should we call you?</h1><p>You’re about to build and run your own business.</p><input className="name-input" value={name} maxLength={60} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && onStart()} placeholder="Your name" autoFocus /><button className="primary" onClick={onStart} disabled={busy || !name.trim()}>{busy ? "Getting ready…" : "Let’s go →"}</button>{error && <div className="notice">{error}</div>}</div></div></main>; }
function Loading({ error, onRetry }: { error: string; onRetry: () => void }) { return <main className="shell"><div className="container loading"><div className="brand">Business Simulator</div><h1>Getting things ready…</h1><p>{error || "Opening your business."}</p>{error && <button className="primary" onClick={onRetry}>Try again</button>}</div></main>; }

function SetupScreen({ onComplete }: { onComplete: (state: GameState) => void }) {
  const [capital, setCapital] = useState(1000000); const [location, setLocation] = useState<Location>("high-footfall"); const [format, setFormat] = useState<BusinessFormat>("small-cafe"); const [menu, setMenu] = useState<MenuItemId[]>(["filter-coffee", "instant-coffee", "masala-chai", "bun-maska", "vada-pav", "veg-sandwich", "espresso"]); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const selectedFormat = FORMAT_OPTIONS.find(x => x.id === format)!; const menuCost = useMemo(() => menu.reduce((sum, id) => sum + (MENU_ITEMS.find(x => x.id === id)?.setupCost ?? 0), 0), [menu]); const setupCost = selectedFormat.cost + menuCost + 50000 + Math.max(30000, menu.length * 15000); const reserve = capital - setupCost;
  const supports = (id: MenuItemId) => { const item = MENU_ITEMS.find(x => x.id === id)!; return item.infrastructure === "kitchen" ? format === "full-cafe" : item.infrastructure === "beverage" ? format !== "takeaway" : true; };
  useEffect(() => { setMenu(current => current.filter(supports)); }, [format]);
  const toggle = (id: MenuItemId) => { if (supports(id)) setMenu(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]); };
  const launch = async () => { setBusy(true); setError(""); try { const r = await fetch("/api/game/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ capital, location, format, menu }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to configure business."); onComplete(d.state as GameState); } catch (e) { setError(e instanceof Error ? e.message : "Unable to configure business."); } finally { setBusy(false); } };
  return <main className="shell"><div className="container setup-container"><section className="hero setup-hero"><div className="day-pill">DAY 0</div><h1>Build your business before you open it.</h1><p>Choose your capital, location, format and menu. What survives setup becomes your working cash.</p></section><SetupSection number="1" title="Starting capital" help="How much are you willing to put into this business?"><div className="actions capital-grid">{CAPITAL_OPTIONS.map(v => <button key={v} className={`action capital-option ${capital === v ? "selected" : ""}`} onClick={() => setCapital(v)}><strong>{capital === v ? "✓ " : ""}{formatINR(v)}</strong><small>{CAPITAL_CAPTIONS[v]}</small></button>)}</div></SetupSection><SetupSection number="2" title="Choose your location" help="Rent is monthly. Location changes demand and pricing potential."><div className="actions option-grid">{LOCATION_OPTIONS.map(o => <button key={o.id} className={`action ${location === o.id ? "selected" : ""}`} onClick={() => setLocation(o.id)}><strong>{location === o.id ? "✓ " : ""}{o.name}</strong><small>{o.description}</small><em>{formatINR(o.rentMonthly)}/month</em></button>)}</div></SetupSection><SetupSection number="3" title="Choose your business format" help="Your format sets capacity and the infrastructure you can afford."><div className="actions option-grid">{FORMAT_OPTIONS.map(o => <button key={o.id} className={`action ${format === o.id ? "selected" : ""}`} onClick={() => setFormat(o.id)}><strong>{format === o.id ? "✓ " : ""}{o.name}</strong><small>{o.description}</small><em>Setup {formatINR(o.cost)} · {o.capacity}/day</em></button>)}</div></SetupSection><SetupSection number="4" title="Build your menu" help="Pick the products you want to sell. A larger menu costs more to establish and operate."><div className="actions menu-grid">{MENU_ITEMS.map(item => { const available = supports(item.id); const selected = menu.includes(item.id); return <button key={item.id} className={`action ${selected ? "selected" : ""} ${!available ? "locked" : ""}`} onClick={() => toggle(item.id)} disabled={!available}><strong>{selected ? "✓ " : ""}{item.name}</strong><small>{available ? `Setup ${formatINR(item.setupCost)} · Weekly ${formatINR(item.weeklyCost)}` : item.infrastructure === "kitchen" ? "Needs a full kitchen" : "Needs beverage equipment"}</small></button>; })}</div></SetupSection><section className="panel review-card"><div className="eyebrow">Your opening plan</div><h2>{formatINR(capital)} starting capital</h2><div className="market"><Row label="Setup investment" value={formatINR(setupCost)} /><Row label="Working cash" value={formatINR(reserve)} /><Row label="Monthly rent" value={formatINR(LOCATION_OPTIONS.find(x => x.id === location)?.rentMonthly ?? 0)} /><Row label="Menu items" value={`${menu.length}`} /></div>{error && <div className="notice">{error}</div>}<button className="primary" onClick={launch} disabled={busy || menu.length < 1 || reserve <= 0}>{busy ? "Setting up…" : "Open my business →"}</button></section></div></main>;
}
function SetupSection({ number, title, help, children }: { number: string; title: string; help: string; children: ReactNode }) { return <section className="panel setup-section"><div className="section-head"><div><div className="eyebrow">Step {number}</div><h2>{title}</h2></div></div><p className="section-help">{help}</p>{children}</section>; }
function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) { return <div className="metric"><span>{label}</span><strong className={good === undefined ? "" : good ? "positive" : "negative"}>{value}</strong></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="row"><span>{label}</span><strong>{value}</strong></div>; }
function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><button className="modal-close" onClick={onClose}>×</button>{children}</div></div>; }
function HistoryModal({ state, onClose }: { state: GameState; onClose: () => void }) { const items = [...state.dayHistory].reverse(); return <Modal onClose={onClose}><div className="feedback-modal"><div className="eyebrow">Your journey</div><h2>Past days</h2><p>See what you decided and what happened next.</p><div className="history-list">{items.length ? items.map(item => <div className="history-item" key={`${item.day}-${item.decision}`}><strong>Day {item.day} · {decisionName(item.decision)}</strong><span>{formatINR(item.profit)} · {item.customers} customers · {formatINR(item.cashAfter)} cash</span><small>Reputation {Math.round(item.reputation)}/100 · Price index {item.priceIndex}</small></div>) : <p>No completed days yet.</p>}</div></div></Modal>; }
function MilestoneModal({ state, onClose }: { state: GameState; onClose: () => void }) { const all: Array<[string,string,string]> = [["open-business","🏪 Open for Business","Start your first business."],["first-sale","🧾 First Sale","Make your first revenue."],["first-customer","👤 First Customer","Serve your first customer."],["100-customers","👥 100 Customers","Serve 100 customers."],["500-customers","👥 500 Customers","Serve 500 customers."],["1000-customers","👥 1,000 Customers","Serve 1,000 customers."],["revenue-1l","💰 ₹1L Revenue","Reach ₹1 lakh cumulative revenue."],["revenue-5l","💰 ₹5L Revenue","Reach ₹5 lakh cumulative revenue."],["revenue-10l","💰 ₹10L Revenue","Reach ₹10 lakh cumulative revenue."],["first-profit","📈 First Profit","Finish a profitable day."],["profit-streak-3","🔥 Momentum","Three profitable days in a row."],["profit-streak-5","🔥 Hot Streak","Five profitable days in a row."],["crisis-survived","🧯 Crisis Survived","Handle a business event and stay afloat."],["bounce-back","🔄 Bounce Back","Recover from a loss-making day."],["reputation-60","⭐ Getting Noticed","Reach 60 reputation."],["reputation-80","⭐ Local Favourite","Reach 80 reputation."],["day-5","📅 Five Days","Survive the first five days."],["day-10","📅 Ten Days","Survive ten days."],["day-30","🏆 Built to Last","Survive thirty days."]]; return <Modal onClose={onClose}><div className="feedback-modal"><div className="eyebrow">Your progress</div><h2>Milestones</h2><p>{state.milestones.length} achieved so far.</p><div className="history-list">{all.map(([id,title,desc]) => <div className={`history-item ${state.milestones.includes(id) ? "selected" : ""}`} key={id}><strong>{state.milestones.includes(id) ? "✓ " : "🔒 "}{title}</strong><span>{desc}</span></div>)}</div></div></Modal>; }
function FeedbackModal({ onSubmit, onSkip }: { onSubmit: (a: { ease: string; gameplay: string; realism: string; decisions: string; continuePlaying: string; comment?: string }) => void; onSkip: () => void }) { const [ease,setEase]=useState(""); const [gameplay,setGameplay]=useState(""); const [realism,setRealism]=useState(""); const [decisions,setDecisions]=useState(""); const [continuePlaying,setContinuePlaying]=useState(""); const [comment,setComment]=useState(""); const q=(label:string,value:string,set:(v:string)=>void,options:string[]) => <div className="feedback-question"><strong>{label}</strong><div className="choice-row">{options.map(o=><button key={o} className={`choice ${value===o?"selected":""}`} onClick={()=>set(o)}>{o}</button>)}</div></div>; return <Modal onClose={onSkip}><div className="feedback-modal"><div className="eyebrow">Quick beta feedback</div><h2>Help us improve the game</h2><p>This takes about 30 seconds. Skip it anytime.</p>{q("Was the game easy to understand?",ease,setEase,["Confusing","Okay","Easy"])}{q("How is the gameplay?",gameplay,setGameplay,["Too easy","About right","Too difficult"])}{q("Does it feel realistic?",realism,setRealism,["Not really","Somewhat","Yes"])}{q("Do you enjoy making the decisions?",decisions,setDecisions,["Not much","It's okay","Yes"])}{q("Would you keep playing?",continuePlaying,setContinuePlaying,["No","Maybe","Definitely"])}<textarea className="feedback-input" value={comment} onChange={e=>setComment(e.target.value)} maxLength={1000} placeholder="Anything you'd change? (optional)" /><button className="primary" disabled={!ease||!gameplay||!realism||!decisions||!continuePlaying} onClick={()=>onSubmit({ease,gameplay,realism,decisions,continuePlaying,comment})}>Send feedback →</button><button className="text-button" onClick={onSkip}>Maybe later</button></div></Modal>; }
