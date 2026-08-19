"use client";

import { useEffect, useMemo, useState } from "react";
import { CAPITAL_OPTIONS, FORMAT_OPTIONS, INITIAL_STATE, LOCATION_OPTIONS, MENU_ITEMS, formatINR, type BusinessFormat, type Decision, type GameState, type Location, type MenuItemId } from "@/lib/simulation";

const decisionLabels: Array<[Decision, string, string]> = [
  ["raise-price", "Raise prices", "Increase average ticket, but demand may soften."],
  ["marketing", "Run marketing", "Spend ₹10,000 to attract more customers."],
  ["hire", "Hire staff", "Spend ₹18,000 to improve service capacity."],
  ["quality", "Improve quality", "Spend ₹12,000 on product and experience."],
  ["inventory", "Restock", "Spend ₹8,000 to protect against stockouts."],
];

export default function Home() {
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [eventOption, setEventOption] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/game/session").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start game.");
      setState(data.state as GameState);
    }).catch((err: Error) => setError(err.message));
  }, []);

  const endDay = async () => {
    if (!state || !selected || (state.currentEvent && !eventOption)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/simulate-turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: selected, eventOption }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to advance simulation.");
      setState(data.state as GameState); setSelected(null); setEventOption(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to advance simulation."); }
    finally { setBusy(false); }
  };

  const submitFeedback = async (rating: number) => {
    if (!state) return;
    const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, replay: rating >= 4, realism: 3, difficulty: 3, sessionDays: state.day }) });
    if (response.ok) setFeedbackSent(true);
  };

  if (!state) return <main className="shell"><div className="container"><section className="hero"><div className="badge">BUSINESS SIMULATOR • PROTOTYPE</div><h1>Starting your Mumbai café…</h1><p>{error || "Creating a secure server-side game session."}</p>{error && <button className="primary" onClick={() => window.location.reload()}>Try again</button>}</section></div></main>;
  if (!state.setupComplete) return <SetupScreen onComplete={setState} />;

  const statusText = state.cash <= 0 ? "Bankrupt" : state.day >= 91 && state.profit > 0 ? "Business survived 90 days" : "Active business";

  return <main className="shell"><div className="container">
    <div className="topbar"><div className="brand">Business Simulator</div><div className="badge">Mumbai • Café • {statusText}</div></div>
    <section className="hero"><div className="badge">DAY {state.day}</div><h1>Run the business. Make the call.</h1><p>Read the situation, choose one action, see the consequence, and move on. The engine owns the numbers; AI is reserved for high-value scenarios.</p>{error && <div className="notice">{error}</div>}</section>

    <section className="grid metrics"><Metric label="Cash" value={formatINR(state.cash)} /><Metric label="Today's revenue" value={formatINR(state.revenue)} /><Metric label="Today's profit" value={formatINR(state.profit)} good={state.profit >= 0} /><Metric label="Customers" value={state.customers.toLocaleString("en-IN")} /><Metric label="Reputation" value={`${state.reputation}/100`} /></section>

    {state.currentEvent && <section className="panel event-panel"><div className="badge">BUSINESS EVENT</div><h2 className="section-title">{state.currentEvent.title}</h2><p>{state.currentEvent.narrative}</p><div className="actions">{state.currentEvent.options.map((option) => <button key={option.id} className={`action ${eventOption === option.id ? "selected" : ""}`} onClick={() => setEventOption(option.id)} disabled={busy}><strong>{eventOption === option.id ? "✓ " : ""}{option.title}</strong><small>{option.description}{option.cost ? ` • Cost ${formatINR(option.cost)}` : ""}</small></button>)}</div><div className="notice">The simulator will evaluate the decision using your actual cash, capacity, reputation and business state.</div></section>}

    <div className="grid main-grid"><section className="panel"><h2 className="section-title">What will you do today?</h2><div className="actions">{decisionLabels.map(([id, title, description]) => <button key={id} className="action" onClick={() => setSelected(id)} disabled={busy}><strong>{selected === id ? "✓ " : ""}{title}</strong><small>{description}</small></button>)}</div><div className="notice">Selected action: <strong>{selected ? decisionLabels.find(([id]) => id === selected)?.[1] : "none"}</strong></div><button className="primary" onClick={endDay} disabled={busy || !selected || !!(state.currentEvent && !eventOption)}>{busy ? "Processing…" : "End day →"}</button></section>
      <section className="panel"><h2 className="section-title">Your business</h2><div className="market"><div className="market-row"><span>Location</span><strong>{LOCATION_OPTIONS.find(x => x.id === state.location)?.name}</strong></div><div className="market-row"><span>Format</span><strong>{FORMAT_OPTIONS.find(x => x.id === state.format)?.name}</strong></div><div className="market-row"><span>Service capacity</span><strong>{state.serviceCapacity}/day</strong></div><div className="market-row"><span>Staff</span><strong>{state.staff}/100</strong></div><div className="market-row"><span>Quality</span><strong>{state.quality}/100</strong></div><div className="market-row"><span>Inventory</span><strong>{state.inventory}/100</strong></div></div><div className="notice">Menu: {state.menu.map(id => MENU_ITEMS.find(x => x.id === id)?.name).join(" • ")}</div></section></div>

    <div className="grid main-grid"><section className="panel"><h2 className="section-title">Startup economics</h2><div className="market"><div className="market-row"><span>Starting capital</span><strong>{formatINR(state.capital)}</strong></div><div className="market-row"><span>Setup investment</span><strong>{formatINR(state.setupCost)}</strong></div><div className="market-row"><span>Opening cash reserve</span><strong>{formatINR(state.cash)}</strong></div><div className="market-row"><span>Current price index</span><strong>{state.priceIndex}/100</strong></div></div></section><section className="panel"><h2 className="section-title">Run feedback</h2><p>Help us tune the simulator. A rating is enough; no long survey.</p>{!feedbackOpen ? <button className="primary" onClick={() => setFeedbackOpen(true)}>Rate this run</button> : feedbackSent ? <div className="notice">Thanks. Your feedback has been recorded.</div> : <div className="actions">{[1,2,3,4,5].map(rating => <button key={rating} className="action" onClick={() => submitFeedback(rating)}><strong>{rating}/5</strong></button>)}</div>}</section></div>
    <div className="footer">Prototype v0.2 • Server-authoritative simulation • Fast decision loop • AI used selectively.</div>
  </div></main>;
}

function SetupScreen({ onComplete }: { onComplete: (state: GameState) => void }) {
  const [capital, setCapital] = useState(1000000);
  const [location, setLocation] = useState<Location>("high-footfall");
  const [format, setFormat] = useState<BusinessFormat>("small-cafe");
  const [menu, setMenu] = useState<MenuItemId[]>(["filter-coffee", "masala-chai"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formatCost = FORMAT_OPTIONS.find(x => x.id === format)?.cost ?? 0;
  const menuCost = useMemo(() => menu.reduce((sum, id) => sum + (MENU_ITEMS.find(x => x.id === id)?.setupCost ?? 0), 0), [menu]);
  const setupCost = formatCost + menuCost + 50000 + Math.max(30000, menu.length * 15000);
  const reserve = capital - setupCost;
  const toggleMenu = (id: MenuItemId) => setMenu(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const launch = async () => {
    setBusy(true); setError("");
    try { const response = await fetch("/api/game/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ capital, location, format, menu }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to configure business."); onComplete(data.state as GameState); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to configure business."); } finally { setBusy(false); }
  };
  return <main className="shell"><div className="container"><section className="hero"><div className="badge">BUSINESS SETUP • DAY 0</div><h1>Build your café before you open it.</h1><p>Your capital is limited. Decide what kind of business you can afford, then live with those choices.</p></section>
    <div className="grid main-grid"><section className="panel"><h2 className="section-title">1. Starting capital</h2><div className="actions">{CAPITAL_OPTIONS.map(value => <button key={value} className={`action ${capital === value ? "selected" : ""}`} onClick={() => setCapital(value)}><strong>{capital === value ? "✓ " : ""}{formatINR(value)}</strong><small>Total money available for this business.</small></button>)}</div></section>
      <section className="panel"><h2 className="section-title">2. Location</h2><div className="actions">{LOCATION_OPTIONS.map(option => <button key={option.id} className={`action ${location === option.id ? "selected" : ""}`} onClick={() => setLocation(option.id)}><strong>{location === option.id ? "✓ " : ""}{option.name}</strong><small>{option.description} Rent {formatINR(option.rent)}/day.</small></button>)}</div></section></div>
    <div className="grid main-grid"><section className="panel"><h2 className="section-title">3. Business format</h2><div className="actions">{FORMAT_OPTIONS.map(option => <button key={option.id} className={`action ${format === option.id ? "selected" : ""}`} onClick={() => setFormat(option.id)}><strong>{format === option.id ? "✓ " : ""}{option.name}</strong><small>Setup {formatINR(option.cost)} • Capacity {option.capacity}/day.</small></button>)}</div></section>
      <section className="panel"><h2 className="section-title">4. Build your menu</h2><div className="actions">{MENU_ITEMS.map(item => <button key={item.id} className={`action ${menu.includes(item.id) ? "selected" : ""}`} onClick={() => toggleMenu(item.id)}><strong>{menu.includes(item.id) ? "✓ " : ""}{item.name}</strong><small>Setup {formatINR(item.setupCost)} • Weekly operating cost {formatINR(item.weeklyCost)} • {item.infrastructure} infrastructure.</small></button>)}</div></section></div>
    <section className="panel"><h2 className="section-title">5. Review before opening</h2><div className="market"><div className="market-row"><span>Starting capital</span><strong>{formatINR(capital)}</strong></div><div className="market-row"><span>Setup investment</span><strong>{formatINR(setupCost)}</strong></div><div className="market-row"><span>Opening cash reserve</span><strong>{formatINR(reserve)}</strong></div></div>{error && <div className="notice">{error}</div>}<button className="primary" onClick={launch} disabled={busy || reserve <= 0 || menu.length === 0}>{busy ? "Opening…" : "Open my business →"}</button></section>
  </div></main>;
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) { return <div className="panel"><div className="metric-label">{label}</div><div className={`metric-value ${good ? "good" : ""}`}>{value}</div></div>; }
