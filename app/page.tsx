"use client";

import { useEffect, useState, type ReactNode } from "react";
import Setup from "@/components/Setup";
import Brewing from "@/components/Brewing";
import { sfx, setSound, soundOn } from "@/lib/sound";
import { startMusic, stopMusic } from "@/lib/music";
import { CafeScene, DecisionIcon, Spark } from "@/components/Art";
import { RUN_LENGTH_DAYS, periodName, slotsForTurn, stageFor, turnLabel, type SpanReport } from "@/lib/cadence";
import {
  FORMAT_OPTIONS, LOCATION_OPTIONS,
  formatINR, formatCompactINR, getAvailableDecisions,
  type BusinessFormat, type Decision, type GameState, type DayRecord,
  type Location, type MenuItemId,
} from "@/lib/simulation";

const DECISIONS: Array<[Decision, string, string]> = [
  ["marketing", "Run marketing", "₹10,000"],
  ["quality", "Improve quality", "₹12,000"],
  ["inventory", "Restock", "from ₹8,000"],
  ["hire", "Hire staff", "₹18,000"],
  ["raise-price", "Raise prices", "Free"],
  ["lower-price", "Lower prices", "Free"],
  ["no-action", "Do nothing", "Free"],
  ["supply-contract", "Supply contract", "₹35,000"],
  ["hire-manager", "Hire a manager", "₹45,000"],
  ["extend-hours", "Extend opening hours", "₹22,000"],
  ["loyalty-programme", "Regulars programme", "₹30,000"],
];

/** What this choice will actually do, given where the business is right now. */
function outlook(id: Decision, state: GameState, spanDays: number): { line: string; warn?: string } {
  const opened = state.day > 1 && state.customers > 0;
  // Before opening there is no trade to reason from, so fall back to a sensible estimate.
  const expected = opened ? state.customers : Math.round(state.serviceCapacity * 0.5);
  const perDay = Math.max(3, Math.round(expected / 9));

  const add = (points: number) => {
    const room = 100 - state.inventory;
    const gained = Math.min(points, room);
    const wasted = points - gained;
    const cover = Math.max(1, Math.round((state.inventory + gained) / perDay));
    const line = `+${gained}% stock · ${cover} days' cover`;
    if (wasted > 0) return { line, warn: `${wasted}% has nowhere to go` };
    if (spanDays > 1 && cover > spanDays * 2) return { line, warn: "More than this period needs" };
    return { line };
  };

  switch (id) {
    case "inventory": return add(30);
    case "inventory-2": return add(60);
    case "inventory-3": return add(90);
    case "marketing": {
      const now = Math.round(state.marketing);
      return { line: `Awareness ${now}% → ${Math.min(100, now + 14)}%`,
               warn: state.inventory < 25 ? "Low stock to serve them" : undefined };
    }
    case "quality":
      return { line: `Quality ${state.quality}% → ${Math.min(100, state.quality + 7)}%`,
               warn: state.quality >= 93 ? "Near the maximum" : undefined };
    case "hire": {
      const used = opened && state.serviceCapacity > 0 ? Math.round((state.customers / state.serviceCapacity) * 100) : null;
      return { line: `Capacity ${state.serviceCapacity} → ${Math.min(600, state.serviceCapacity + 15)}/day`,
               warn: used !== null && used < 70 ? `Only ${used}% used — adds wages` : undefined };
    }
    case "raise-price":
      return { line: `Price ${state.priceIndex} → ${Math.min(140, state.priceIndex + 6)}`,
               warn: state.consecutivePriceRaises >= 2 ? "Customers are noticing" : undefined };
    case "lower-price":
      return { line: `Price ${state.priceIndex} → ${Math.max(100, state.priceIndex - 6)}` };
    case "supply-contract":
      return { line: "Stock stays near 78% by itself",
               warn: spanDays < 14 ? "Best on longer periods" : undefined };
    case "hire-manager":
      return { line: "Steadier service · +₹2,600/day" };
    case "extend-hours":
      return { line: `Capacity ${state.serviceCapacity} → ${Math.min(600, state.serviceCapacity + 40)}/day`,
               warn: state.inventory < 30 ? "Needs more stock" : undefined };
    case "loyalty-programme":
      return { line: "Regulars return more often",
               warn: state.reputation < 45 ? "Works better once liked" : undefined };
    default:
      return { line: `Spend nothing this ${spanDays > 1 ? "period" : "day"}`,
               warn: state.inventory < 20 ? "Stock is low" : undefined };
  }
}

const idxOf = (id: Decision) => DECISIONS.findIndex(d => d[0] === id);
const RESTOCKS: Array<[Decision, string, number, number]> = [
  ["inventory", "Small delivery", 30, 8000],
  ["inventory-2", "Double delivery", 60, 15000],
  ["inventory-3", "Full restock", 90, 21000],
];
/** How many delivery sizes are on offer, by how long the turn is. */
const restockChoices = (spanDays: number) => (spanDays >= 14 ? 3 : spanDays >= 7 ? 2 : 1);
const STRATEGIC = new Set<Decision>(["supply-contract", "hire-manager", "extend-hours", "loyalty-programme"]);
const decisionName = (id: Decision) => DECISIONS.find(x => x[0] === id)?.[1] ?? "your decision";

const EVENT_NAMES: Record<string, string> = {
  "health-inspection": "Health inspection", "rent-hike": "Landlord raised the rent",
  "delivery-app": "Delivery app approached you", "monsoon-flood": "The street flooded",
  "power-cut": "Power cut", "staff-poached": "Staff being poached",
  "food-blogger": "A food blogger came in", "licence-renewal": "Licence renewal",
  "construction": "Roadworks outside", "rival-closes": "A rival shut down",
  "bad-review": "Customers noticed the prices", "supplier-increase": "Supplier raised prices",
  "staff-absence": "Staff member away", "rain": "Rain slowed the street",
  "competitor-promotion": "Competitor promotion", "local-event": "Local event nearby",
  "equipment-issue": "Equipment trouble", "viral-mention": "Someone talked about you",
  "bulk-order": "Bulk order offered", "stock-shortage": "Stock ran low",
};
const EVENT_CHOICES: Record<string, string> = {
  "full-clean": "Closed and cleaned properly", "quick-tidy": "Tidied and hoped",
  "negotiate-rent": "Negotiated", "accept-rent": "Accepted the rise",
  "join-app": "Joined the platform", "stay-off": "Stayed independent",
  "sandbags": "Protected the shop", "shut-early": "Shut early",
  "hire-genset": "Hired a generator", "wait-it-out": "Waited it out",
  "match-offer-staff": "Matched the offer", "let-them-go": "Let them go",
  "look-after-them": "Looked after them", "treat-normal": "Treated them normally",
  "pay-proper": "Filed it myself", "use-agent": "Used an agent",
  "signage": "Put up signage", "ride-construction": "Waited it out",
  "hire-their-staff": "Hired their barista", "welcome-regulars": "Welcomed the crowd",
  "emergency-stock": "Emergency restock", "conserve-stock": "Conserved stock",
  "hold-price": "Held prices", "add-value": "Added a value offer", "ignore-review": "Ignored it",
  "accept-supplier": "Accepted the increase", "switch-supplier": "Switched supplier",
  "delivery-push": "Pushed a promotion", "ride-it-out": "Rode it out",
  "match-offer": "Matched the offer", "differentiate": "Leaned into quality", "ignore-competitor": "Ignored them",
  "prepare-staff": "Brought in extra staff", "take-the-risk": "Took the chance",
  "repair-now": "Repaired it", "delay-repair": "Delayed the repair",
  "amplify": "Amplified it", "let-it-spread": "Let it spread",
  "accept-order": "Accepted the order", "decline-order": "Declined politely",
  "cover-shift": "Covered the shift", "run-short": "Ran short",
};

const MILESTONES: Record<string, string> = {
  "quarter-one": "Three months", "half-year": "Half a year", "full-year": "A full year",
  "steady-hand": "Steady hand", "fair-price": "Fair price", "bounced-back": "Bounced back",
  "word-gets-around": "Word gets around", "read-the-room": "Read the room",
  "lean-operator": "Lean operator", "full-house": "Full house",
  "profitable-month": "A profitable month", "profit-5l": "₹5L profit", "profit-20l": "₹20L profit",
  "served-5000": "5,000 served", "supply-secured": "Supply secured",
  "manager-hired": "Someone to run the floor", "doubled-capacity": "Twice the cafe",
  "open-business": "Opened up", "first-sale": "First sale", "first-customer": "First customer",
  "100-customers": "100 customers", "500-customers": "500 customers", "1000-customers": "1,000 customers",
  "revenue-1l": "₹1L revenue", "revenue-5l": "₹5L revenue", "revenue-10l": "₹10L revenue",
  "first-profit": "First profit", "profit-streak-3": "3 good days", "profit-streak-5": "5 good days",
  "crisis-survived": "Survived a crisis", "bounce-back": "Bounced back",
  "reputation-60": "Getting noticed", "reputation-80": "Local favourite",
  "day-5": "Five days", "day-10": "Ten days", "day-30": "Thirty days",
  "week-one": "First week", "month-one": "First month", "profit-500k": "₹5L profit",
};

type MetricKey = "cash" | "customers" | "profit" | "reputation" | "stock" | "staff";

type Screen = "loading" | "welcome" | "cafe-name" | "setup" | "game";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [player, setPlayer] = useState<{ id: string; display_name: string } | null>(null);
  const [name, setName] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [state, setState] = useState<GameState | null>(null);
  const [picked, setPicked] = useState<Decision[]>([]);
  const [eventOption, setEventOption] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ before: GameState; after: GameState; decision: Decision; picked: Decision[]; report?: SpanReport } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [detail, setDetail] = useState<MetricKey | null>(null);
  const [promoted, setPromoted] = useState<{ from: string; to: string; label: string } | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [audio, setAudio] = useState(false);
  useEffect(() => { setAudio(soundOn()); }, []);
  useEffect(() => {
    if (!audio) { stopMusic(); return; }
    const kick = () => { startMusic(); window.removeEventListener("pointerdown", kick); };
    window.addEventListener("pointerdown", kick, { once: true });
    startMusic();
    return () => window.removeEventListener("pointerdown", kick);
  }, [audio]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => { (async () => {
    try {
      const p = await fetch("/api/player"); const pd = await p.json();
      const s = await fetch("/api/game/session"); const sd = await s.json();
      if (!s.ok) throw new Error(sd.error || "Unable to start the game.");
      const gs = sd.state as GameState;
      setState(gs);
      if (pd.player) { setPlayer(pd.player); setName(pd.player.display_name); }
      if (gs.setupComplete) setScreen("game");
      else if (pd.player) setScreen("cafe-name");
      else setScreen("welcome");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load."); setScreen("welcome"); }
  })(); }, []);

  useEffect(() => {
    if (screen !== "game" || !state) return;
    const finished = state.cash <= 0 || state.day > RUN_LENGTH_DAYS;
    if (finished && localStorage.getItem("bs-feedback-asked") !== "1") setFeedbackOpen(true);
  }, [screen, state]);

  const saveName = async () => {
    if (!name.trim()) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Please enter your name.");
      setPlayer(d.player); setScreen("cafe-name");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  const openCafe = async (cfg: { capital: number; location: Location; format: BusinessFormat; menu: MenuItemId[] }) => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/game/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessName: cafeName.trim(), ...cfg }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to open your cafe.");
      setState(d.state as GameState); setScreen("game");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to open your cafe."); }
    finally { setBusy(false); }
  };

  const finishDay = async () => {
    if (!state || picked.length === 0 || (state.currentEvent && !eventOption)) return;
    const before = state; const chosen = [...picked];
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/simulate-turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decisions: chosen, decision: chosen[0], eventOption }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to finish the turn.");
      const after = d.state as GameState;
      setState(after); setPicked([]); setEventOption(null);
      setSummary({ before, after, decision: chosen.find(x => x !== "no-action") ?? chosen[0], picked: chosen, report: d.report as SpanReport | undefined });
      const gained = (d.report as SpanReport | undefined)?.profit ?? after.profit;
      if (after.milestones.length > before.milestones.length) sfx.milestone();
      else if (gained > 0) sfx.coin(); else sfx.loss();
      const wasStage = stageFor(before.day), nowStage = stageFor(after.day);
      if (wasStage.id !== nowStage.id) setPromoted({ from: wasStage.unit, to: nowStage.unit, label: nowStage.label });
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to finish the turn."); }
    finally { setBusy(false); }
  };

  const newGame = async () => {
    if (!confirm("Start a new game? Your current run stays saved.")) return;
    setBusy(true);
    try {
      const r = await fetch("/api/game/new", { method: "POST" }); const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setState(d.state as GameState); setCafeName(""); setPicked([]); setEventOption(null);
      setSummary(null); setScreen("cafe-name");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to start a new game."); }
    finally { setBusy(false); }
  };

  const submitFeedback = async (answers: Record<string, string | boolean | undefined>) => {
    if (!state) return;
    await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...answers, sessionDays: state.day }) });
    localStorage.setItem("bs-feedback-asked", "1");
    setFeedbackOpen(false);
  };

  if (screen === "loading") return <Screen><Eyebrow>Getting ready</Eyebrow><H1>Opening up…</H1><P>One moment.</P></Screen>;

  if (screen === "welcome") return (
    <Screen>
      <Eyebrow>Welcome</Eyebrow>
      <H1>Build it. Run it.<br />See what happens.</H1>
      <P>A cafe in Mumbai. One year to make it work. Every decision has consequences — and there are no perfect answers.</P>
      <label className="field-label" htmlFor="yourname">First, what should we call you?</label>
      <input id="yourname" className="input" value={name} maxLength={60} autoFocus
        onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveName()} placeholder="Your name" />
      <button className="primary" onClick={saveName} disabled={busy || !name.trim()}>{busy ? "One moment…" : "Continue"}</button>
      {error && <div className="notice">{error}</div>}
    </Screen>
  );

  if (screen === "cafe-name") return (
    <Screen>
      <Eyebrow>Step 1 of 2</Eyebrow>
      <H1>What&rsquo;s your cafe called?</H1>
      <P>Give it a name. It&rsquo;s yours from here on.</P>
      <input className="input" value={cafeName} maxLength={40} autoFocus
        onChange={e => setCafeName(e.target.value)} onKeyDown={e => e.key === "Enter" && cafeName.trim() && setScreen("setup")} placeholder="Brew &amp; Bean" />
      <button className="primary" onClick={() => setScreen("setup")} disabled={!cafeName.trim()}>Continue</button>
      <div className="disclaimer">
        <strong>This is a game, not a business prediction tool.</strong>
        <span>It uses simplified economics so you can experiment and see how choices play out. Don&rsquo;t use it as financial or business advice.</span>
      </div>
      {error && <div className="notice">{error}</div>}
    </Screen>
  );

  if (screen === "setup") return (
    <Setup cafeName={cafeName} busy={busy} error={error} onBack={() => setScreen("cafe-name")} onOpen={openCafe} />
  );

  if (!state) return <Screen><H1>Something went wrong.</H1><P>{error || "Please refresh."}</P></Screen>;

  if (state.cash <= 0 || state.day > RUN_LENGTH_DAYS) {
    const won = state.day > RUN_LENGTH_DAYS && state.cumulativeProfit > 0;
    const survived = state.day > RUN_LENGTH_DAYS && !won;
    return (
      <>
        <Screen>
          <Eyebrow>{won ? "You built it" : survived ? "One year" : "Out of cash"}</Eyebrow>
          <H1>{won ? "You made it." : survived ? "You survived." : "The money ran out."}</H1>
          <P>{won ? `${state.businessName || "Your cafe"} made it through a full year in profit. That's a win.`
            : survived ? `${state.businessName || "Your cafe"} lasted a full year but didn't finish in profit. That's a lesson, not a failure.`
            : `${state.businessName || "Your cafe"} couldn't fund another day.`}</P>
          <div className="endgrid">
            <div><span>Days open</span><strong>{Math.max(0, state.day - 1)}</strong></div>
            <div><span>Customers served</span><strong>{state.totalCustomers.toLocaleString("en-IN")}</strong></div>
            <div><span>Total revenue</span><strong>{formatINR(state.cumulativeRevenue)}</strong></div>
            <div><span>Total profit</span><strong className={state.cumulativeProfit >= 0 ? "pos" : "neg"}>{formatINR(state.cumulativeProfit)}</strong></div>
          </div>
          <button className="primary" onClick={newGame}>Start a new game</button>
        </Screen>
        {feedbackOpen && <FeedbackModal onDone={submitFeedback} />}
      </>
    );
  }

  const series = (k: "cash" | "customers" | "profit" | "reputation" | "inventory") =>
    [...state.dayHistory.slice(-7).map(r => Number(k === "cash" ? r.cashAfter : k === "customers" ? r.customers : k === "profit" ? r.profit : k === "reputation" ? r.reputation : r.inventory))];
  const available = new Set(getAvailableDecisions(state));
  const slots = slotsForTurn(state.day);
  const spanDays = stageFor(state.day).days;
  const location = LOCATION_OPTIONS.find(x => x.id === state.location);
  const format = FORMAT_OPTIONS.find(x => x.id === state.format);

  return (
    <main className="shell">
      <div className="wrap game-wrap">
        <header className="bar">
          <div>
            <div className="cafe">{state.businessName || "Your cafe"}</div>
            <div className="sub">{turnLabel(state.day)} · {stageFor(state.day).label}{state.weatherToday && state.weatherToday !== "clear" ? ` · ${({hot:"Hot",rain:"Rain",cold:"Cold",festival:"Festival"} as Record<string,string>)[state.weatherToday]}` : ""}</div>
          </div>
          <div className="bar-actions">
            <button className="ghost" onClick={() => { const next = !audio; setSound(next); setAudio(next); if (next) { startMusic(); sfx.select(); } else stopMusic(); }} aria-label={audio ? "Turn sound off" : "Turn sound on"}>{audio ? "🔊" : "🔇"}</button>
            <button className="ghost" onClick={() => { sfx.tap(); setHistoryOpen(true); }}>History</button>
            <button className="ghost" onClick={newGame} disabled={busy}>New</button>
          </div>
        </header>

        <button className="scene-tap" onClick={() => setLedgerOpen(true)} aria-label="Open the books">
          <CafeScene tone={state.day <= 1 ? "" : state.profit > 0 ? "good" : "bad"} format={state.format} busy={state.serviceCapacity > 0 ? state.customers / state.serviceCapacity : 0} raining={state.currentEvent?.id === "rain"} weather={state.weatherToday} />
          <span className="scene-hint">{state.day <= 1 ? "Opening tomorrow" : state.customers > 0 ? `${state.customers} in yesterday` : "Nobody in yesterday"} · tap for the books</span>
        </button>

        <div className="metrics">
          <Metric label="Cash" value={formatCompactINR(state.cash)} series={series("cash")} onClick={() => setDetail("cash")} />
          <Metric label="Customers" value={state.day <= 1 ? "—" : state.customers.toLocaleString("en-IN")} series={series("customers")} onClick={() => setDetail("customers")} />
          <Metric label="Profit" value={state.day <= 1 ? "—" : formatCompactINR(state.profit)} tone={state.profit >= 0 ? "pos" : "neg"} series={series("profit")} onClick={() => setDetail("profit")} />
          <Metric label="Reputation" value={`${Math.round(state.reputation)}%`} series={series("reputation")} onClick={() => setDetail("reputation")} />
          <Metric label="Stock" value={`${Math.round(state.inventory)}%`} tone={state.inventory < 20 ? "neg" : undefined} series={series("inventory")} onClick={() => setDetail("stock")} />
          <Metric label="Staff" value={`${state.staff}%`} onClick={() => setDetail("staff")} />
        </div>

        <section className="card play-card">
          <div className="play-head">
          {state.currentEvent && eventOption && (
            <button className="event-chip" onClick={() => setEventOption(null)}>
              <span>{state.currentEvent.title}</span>
              <strong>{state.currentEvent.options.find(o => o.id === eventOption)?.title}</strong>
              <em>change</em>
            </button>
          )}
          <Eyebrow>{turnLabel(state.day)}</Eyebrow>
          <h2>{stageFor(state.day).id === "daily" ? `How will you run ${state.businessName || "the cafe"} today?` : `What\u2019s your plan for the next ${periodName(state.day)}?`}</h2>
          <div className="slotline">
            {slots > 1
              ? <>Choose up to <strong>{slots}</strong> things to do this {periodName(state.day)}. {picked.length} chosen.</>
              : <>Choose <strong>one</strong> thing to do today.</>}
          </div>
          </div>
          <div className="dec-grid">
            {DECISIONS.filter(([id]) => available.has(id) || !STRATEGIC.has(id)).map(([id, title, cost]) => {
              const on = id === "inventory" ? picked.some(x => x.startsWith("inventory")) : picked.includes(id);
              const blockedByPrice = (id === "raise-price" && picked.includes("lower-price")) || (id === "lower-price" && picked.includes("raise-price"));
              const full = !on && picked.length >= slots;
              const ok = available.has(id) && !blockedByPrice && !full;
              const look = outlook(id === "inventory" ? (RESTOCKS.find(r => picked.includes(r[0]))?.[0] ?? "inventory") : id, state, spanDays);
              const why = !available.has(id) ? "Not available right now"
                : blockedByPrice ? "You already changed prices this turn"
                : full ? "No slots left this turn"
                : look.line;
              return (
                <button key={id} style={{ animationDelay: `${Math.min(8, idxOf(id)) * 28}ms` }} className={`choice-card dec pop ${on ? "selected" : ""} ${!ok && !on ? "locked" : ""}`}
                  onClick={() => {
                    const chosenRestock = picked.find(x => x.startsWith("inventory"));
                    if (id === "inventory") {
                      if (chosenRestock) { sfx.tap(); setPicked(p => p.filter(x => !x.startsWith("inventory"))); }
                      else if (ok) { sfx.tap(); setRestockOpen(true); }
                      return;
                    }
                    if (on) { sfx.tap(); setPicked(p => p.filter(x => x !== id)); }
                    else if (ok) { sfx.select(); setPicked(p => [...p, id]); }
                  }}
                  disabled={busy || (!ok && !on)}>
                  <div className="dec-row">
                    {STRATEGIC.has(id) && <span className="strat-flag">Long term</span>}
                    <DecisionIcon id={id} />
                    <strong>{id === "inventory" ? (RESTOCKS.find(r => picked.includes(r[0]))?.[1] ?? title) : title}</strong>
                    <span className="dec-cost">{id === "inventory" ? (RESTOCKS.find(r => picked.includes(r[0])) ? formatINR(RESTOCKS.find(r => picked.includes(r[0]))![3]) : cost) : cost}</span>
                    {on && <span className="tick">✓</span>}
                  </div>
                  <small className={(ok || on) && look.warn ? "warned" : ""}>{(ok || on) && look.warn ? look.warn : why}</small>
                </button>
              );
            })}
          </div>
          <Journey state={state} onOpen={() => setMilestonesOpen(true)} />
          <button className="primary" onClick={finishDay} disabled={busy || picked.length === 0 || !!(state.currentEvent && !eventOption)}>
            {busy ? "Playing it out…" : stageFor(state.day).id === "daily" ? "Finish the day" : `Run the ${periodName(state.day)}`}
          </button>
          {error && <div className="notice">{error}</div>}
        </section>
      </div>

      {state.currentEvent && !eventOption && !summary && (
        <EventModal event={state.currentEvent} cash={state.cash} onChoose={setEventOption} />
      )}
      {busy && !summary && <div className="backdrop brew-backdrop"><Brewing label={stageFor(state.day).id === "daily" ? "Running the day…" : `Running the ${periodName(state.day)}…`} /></div>}
      {summary && <DaySummary {...summary} onClose={() => setSummary(null)} />}
      {!summary && promoted && <PromotionModal {...promoted} onClose={() => setPromoted(null)} />}
      {detail && <MetricDetail metric={detail} state={state} onClose={() => setDetail(null)} />}
      {restockOpen && (
        <RestockModal state={state} spanDays={spanDays} cash={state.cash}
          onPick={(d) => { sfx.select(); setPicked(p => [...p.filter(x => !x.startsWith("inventory")), d]); setRestockOpen(false); }}
          onClose={() => setRestockOpen(false)} />
      )}
      {ledgerOpen && <LedgerModal state={state} onClose={() => setLedgerOpen(false)} />}
      {milestonesOpen && <MilestoneModal state={state} onClose={() => setMilestonesOpen(false)} />}
      {historyOpen && <HistoryModal state={state} onClose={() => setHistoryOpen(false)} />}
      {feedbackOpen && <FeedbackModal onDone={submitFeedback} />}
    </main>
  );
}

function RestockModal({ state, spanDays, cash, onPick, onClose }: { state: GameState; spanDays: number; cash: number; onPick: (d: Decision) => void; onClose: () => void }) {
  const count = restockChoices(spanDays);
  const options = RESTOCKS.slice(0, count);
  return (
    <Modal onClose={onClose}>
      <div className="eyebrow">Restock</div>
      <h2>How much are you ordering?</h2>
      <p className="detail-what">
        You are at {Math.round(state.inventory)}% stock.
        {count === 1 ? " On a single day a small delivery is all you can take in." : ` Planning a ${spanDays >= 28 ? "month" : spanDays >= 14 ? "fortnight" : "week"} means you can order bigger.`}
      </p>
      <div className="stack">
        {options.map(([id, label, points, cost]) => {
          const look = outlook(id, state, spanDays);
          const tooDear = cost > cash;
          return (
            <button key={id} className={`choice-card ${tooDear ? "locked" : ""}`} disabled={tooDear} onClick={() => onPick(id)}>
              <div className="choice-head"><strong>{label}</strong><span className="dec-cost">{formatINR(cost)}</span></div>
              <small>{tooDear ? "More than you have in the bank" : look.line}</small>
              {!tooDear && look.warn && <em className="dec-warn">{look.warn}</em>}
              <em className="restock-raw">+{points}% ordered</em>
            </button>
          );
        })}
      </div>
      {count < 3 && <p className="daymsg">Bigger deliveries unlock when you plan further ahead.</p>}
    </Modal>
  );
}

function LedgerModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const loc = LOCATION_OPTIONS.find(l => l.id === state.location);
  const fmt = FORMAT_OPTIONS.find(f => f.id === state.format);
  const rentDaily = Math.round((loc?.rentMonthly ?? 0) / 30);
  const payrollDaily = 7000 + Math.round(state.staff * 60);
  const daysOpen = Math.max(1, state.day - 1);
  const avgRevenue = Math.round(state.cumulativeRevenue / daysOpen);
  const costs = Math.round((state.cumulativeRevenue - state.cumulativeProfit) / daysOpen);
  return (
    <Modal onClose={onClose}>
      <div className="eyebrow">{state.businessName || "Your cafe"}</div>
      <h2>The books</h2>
      <p className="detail-what">{fmt?.name} in {loc?.name}. Open {daysOpen} day{daysOpen === 1 ? "" : "s"}.</p>

      <div className="ledger-head">Yesterday</div>
      <div className="plan-rows">
        <div><span>Customers served</span><strong>{state.customers}</strong></div>
        <div><span>Revenue</span><strong>{formatINR(state.revenue)}</strong></div>
        <div><span>Profit</span><strong className={state.profit >= 0 ? "pos" : "neg"}>{formatINR(state.profit)}</strong></div>
        <div><span>Stock wasted</span><strong>{formatINR(state.wastageToday)}</strong></div>
      </div>

      <div className="ledger-head">What it costs to open the doors</div>
      <div className="plan-rows">
        <div><span>Rent</span><strong>{formatINR(rentDaily)}/day</strong></div>
        <div><span>Wages</span><strong>{formatINR(payrollDaily)}/day</strong></div>
        <div><span>Average daily costs</span><strong>{formatINR(costs)}</strong></div>
        <div><span>Average daily revenue</span><strong>{formatINR(avgRevenue)}</strong></div>
      </div>

      <div className="ledger-head">Since you opened</div>
      <div className="plan-rows">
        <div><span>Total customers</span><strong>{state.totalCustomers.toLocaleString("en-IN")}</strong></div>
        <div><span>Total revenue</span><strong>{formatINR(state.cumulativeRevenue)}</strong></div>
        <div><span>Total profit</span><strong className={state.cumulativeProfit >= 0 ? "pos" : "neg"}>{formatINR(state.cumulativeProfit)}</strong></div>
        <div><span>Good days vs bad</span><strong>{state.profitableDays} / {state.lossDays}</strong></div>
        <div><span>Can serve</span><strong>{state.serviceCapacity}/day</strong></div>
        <div><span>Menu</span><strong>{state.menu.length} items</strong></div>
      </div>
      <button className="primary" onClick={onClose}>Close the books</button>
    </Modal>
  );
}

function PromotionModal({ from, to, label, onClose }: { from: string; to: string; label: string; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="promo">
        <div className="promo-mark">✦</div>
        <div className="eyebrow">{label}</div>
        <h2>You&rsquo;re past the hard part.</h2>
        <p>The cafe is standing on its own feet. You don&rsquo;t need to watch it every {from} any more — from here you&rsquo;ll plan a {to} at a time.</p>
        <div className="promo-steps">
          <span className="done">Every {from}</span>
          <i>→</i>
          <span className="now">Every {to}</span>
        </div>
        <p className="promo-note">More time passes between your decisions, so each one carries further. You&rsquo;ll also get more than one thing to do.</p>
        <button className="primary" onClick={onClose}>Keep going</button>
      </div>
    </Modal>
  );
}

function MetricDetail({ metric, state, onClose }: { metric: MetricKey; state: GameState; onClose: () => void }) {
  const hist = state.dayHistory;
  const rentMonthly = LOCATION_OPTIONS.find(l => l.id === state.location)?.rentMonthly ?? 0;
  const rentDaily = Math.round(rentMonthly / 30);
  const payrollDaily = 7000 + Math.round(state.staff * 60);
  const fixedDaily = rentDaily + payrollDaily;
  const daysOpen = Math.max(1, state.day - 1);
  const avgCustomers = Math.round(state.totalCustomers / daysOpen);
  const prev = hist.length > 1 ? hist[hist.length - 2] : null;
  const first = hist.length ? hist[0] : null;
  const runway = state.profit < 0 ? Math.floor(state.cash / Math.abs(state.profit)) : null;
  const stockCover = state.customers > 0 ? (state.inventory / Math.max(1, state.customers / 9)).toFixed(1) : "—";

  const D: Record<MetricKey, { title: string; big: string; what: string; rows: Array<[string, string]>; note?: string }> = {
    cash: {
      title: "Cash", big: formatINR(state.cash),
      what: "Money you can actually spend right now. Every action you take comes out of this, and if it reaches zero the business closes.",
      rows: [["Rent", `${formatINR(rentMonthly)}/month (${formatINR(rentDaily)} a day)`],
             ["Wages", `about ${formatINR(payrollDaily)} a day`],
             ["Fixed costs", `${formatINR(fixedDaily)} a day before you sell anything`]],
      note: runway !== null
        ? `At yesterday's loss you have roughly ${runway} day${runway === 1 ? "" : "s"} of cash left. Rent and wages keep coming whether customers do or not.`
        : "You're covering your costs at the moment. Rent and wages still come out every single day.",
    },
    customers: {
      title: "Customers", big: state.customers.toLocaleString("en-IN"),
      what: "How many people came in on the most recent day — not a total. Your total is counted separately below.",
      rows: [["Average per day", `${avgCustomers}`],
             ["Since you opened", `${state.totalCustomers.toLocaleString("en-IN")} people`],
             ["Vs yesterday", prev ? `${state.customers - prev.customers > 0 ? "+" : ""}${state.customers - prev.customers}` : "—"],
             ["Vs your first day", first ? `${state.customers - first.customers > 0 ? "+" : ""}${state.customers - first.customers}` : "—"]],
      note: `You can serve up to ${state.serviceCapacity} people a day. Past that, service suffers and reputation drops.`,
    },
    profit: {
      title: "Profit", big: formatINR(state.profit),
      what: state.profit < 0
        ? "This is the most recent day on its own, not your whole run. A red number means that one day cost more than it earned."
        : "This is what the most recent day earned after all its costs — not your whole run.",
      rows: [["Most recent day", formatINR(state.profit)],
             ["Whole run so far", formatINR(state.cumulativeProfit)],
             ["Total revenue", formatINR(state.cumulativeRevenue)],
             ["Good days vs bad", `${state.profitableDays} good, ${state.lossDays} bad`]],
      note: state.cumulativeProfit < 0 && state.profit > 0
        ? "Yesterday made money, but you're still behind overall. Early losses take time to earn back."
        : state.cumulativeProfit > 0 && state.profit < 0
        ? "One bad day, but you're still ahead overall. Worth watching, not panicking about."
        : "Profit and cash are different things — you can be profitable and still short of cash, or the other way round.",
    },
    reputation: {
      title: "Reputation", big: `${Math.round(state.reputation)}%`,
      what: "What people locally think of you. It pulls customers in slowly and pushes them away quickly.",
      rows: [["Now", `${Math.round(state.reputation)}%`],
             ["Vs yesterday", prev ? `${(state.reputation - prev.reputation).toFixed(1)}` : "—"],
             ["Your quality", `${state.quality}%`],
             ["Ceiling from quality", `${Math.min(100, state.quality + 22)}%`]],
      note: `Reputation follows quality. It can sit up to 22 points above your quality of ${state.quality}%, but no higher — push past that and it drifts back down. It also falls when you run out of stock, raise prices repeatedly, or serve nobody at all.`,
    },
    stock: {
      title: "Stock", big: `${Math.round(state.inventory)}%`,
      what: "How much you have to sell. Run out and you turn people away; hold too much and it spoils.",
      rows: [["Days of cover", `${stockCover} days at yesterday's trade`],
             ["Wasted yesterday", formatINR(state.wastageToday)],
             ["Healthy range", "45% to 82%"]],
      note: state.inventory < 20 ? "You're nearly out. Restock before your next busy day."
        : state.inventory > 82 ? "You're overstocked, and the excess is going to waste each day."
        : "You're in a healthy range. Restocking now would mostly create waste.",
    },
    staff: {
      title: "Staff", big: `${state.staff}%`,
      what: "How well staffed you are. More staff means you can serve more people without service falling apart.",
      rows: [["Can serve", `${state.serviceCapacity} people a day`],
             ["Served yesterday", `${state.customers}`],
             ["Wage bill", `about ${formatINR(payrollDaily)} a day`]],
      note: state.customers >= state.serviceCapacity * 0.9
        ? "You're close to your limit. Hiring would let you serve more, but wages rise straight away."
        : "You have room to serve more people than turned up. Hiring now would add cost without adding sales.",
    },
  };
  const d = D[metric];
  return (
    <Modal onClose={onClose}>
      <div className="eyebrow">{d.title}</div>
      <div className="detail-big">{d.big}</div>
      <p className="detail-what">{d.what}</p>
      <div className="plan-rows">
        {d.rows.map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
      </div>
      {d.note && <p className="daymsg">{d.note}</p>}
      <button className="primary" onClick={onClose}>Got it</button>
    </Modal>
  );
}

function EventModal({ event, cash, onChoose }: { event: NonNullable<GameState["currentEvent"]>; cash: number; onChoose: (id: string) => void }) {
  return (
    <div className="backdrop">
      <div className="sheet event-sheet">
        <div className="eyebrow">Something happened</div>
        <h2>{event.title}</h2>
        <p>{event.narrative}</p>
        <div className="stack">
          {event.options.map(o => {
            const tooDear = o.cost > cash;
            return (
              <button key={o.id} className={`choice-card ${tooDear ? "locked" : ""}`} disabled={tooDear} onClick={() => onChoose(o.id)}>
                <div className="choice-head"><strong>{o.title}</strong><span className="dec-cost">{o.cost ? formatINR(o.cost) : "No cost"}</span></div>
                <small>{tooDear ? "You cannot afford this right now." : o.description}</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Journey({ state, onOpen }: { state: GameState; onOpen: () => void }) {
  const pct = Math.min(100, Math.round((state.day / RUN_LENGTH_DAYS) * 100));
  const earned = state.milestones.filter(m => MILESTONES[m]).length;
  return (
    <button className="journey" onClick={onOpen}>
      <div className="journey-top">
        <span>Your journey</span>
        <strong>{earned} milestone{earned === 1 ? "" : "s"} ›</strong>
      </div>
      <div className="jbar"><i style={{ width: `${Math.max(2, pct)}%` }} /></div>
      <div className="jmeta">Day {state.day} of {RUN_LENGTH_DAYS} · {state.totalCustomers.toLocaleString("en-IN")} served</div>
    </button>
  );
}

const MILESTONE_ORDER: string[] = [
  "open-business", "week-one", "first-profit", "crisis-survived", "bounce-back",
  "month-one", "steady-hand", "fair-price", "profitable-month", "full-house",
  "word-gets-around", "read-the-room", "quarter-one", "bounced-back", "lean-operator",
  "profit-5l", "supply-secured", "manager-hired", "served-5000", "half-year",
  "doubled-capacity", "profit-20l", "full-year",
];

function MilestoneModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const has = new Set(state.milestones);
  const earned = MILESTONE_ORDER.filter(m => has.has(m)).length;
  return (
    <Modal onClose={onClose}>
      <div className="eyebrow">Your journey</div>
      <h2>{earned} of {MILESTONE_ORDER.length} milestones</h2>
      <p className="detail-what">Everything {state.businessName || "your cafe"} has managed so far, and what is still ahead.</p>
      <div className="timeline">
        <div className="timeline-track">
          {MILESTONE_ORDER.map(id => {
            const done = has.has(id);
            return (
              <div key={id} className={`tl-item ${done ? "done" : ""}`}>
                <i className="tl-dot">{done ? "✓" : ""}</i>
                <span>{MILESTONES[id] ?? id}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="daymsg">Swipe across to see what is coming.</p>
      <button className="primary" onClick={onClose}>Back to the cafe</button>
    </Modal>
  );
}

function DaySummary({ before, after, decision, picked, report, onClose }: { before: GameState; after: GameState; decision: Decision; picked: Decision[]; report?: SpanReport; onClose: () => void }) {
  const multi = !!report && report.days > 1;
  const dCustomers = after.customers - before.customers;
  const dProfit = Math.round(after.profit - before.profit);
  const dRep = Math.round((after.reputation - before.reputation) * 10) / 10;
  const spent = Math.max(0, before.cash + (report ? report.profit : after.profit) - after.cash);
  const sign = (n: number) => (n > 0 ? `+${n.toLocaleString("en-IN")}` : n.toLocaleString("en-IN"));
  const cls = (n: number) => (n > 0 ? "pos" : n < 0 ? "neg" : "");
  const custSeries = [...after.dayHistory.slice(-14).map(r => r.customers)];
  const fresh = after.milestones.filter(m => !before.milestones.includes(m) && MILESTONES[m]);
  const madeMoney = report ? report.profit > 0 : after.profit > 0;
  const wentBadly = (report ? report.profit < 0 : after.profit < 0) || !!report?.interrupted;
  // Celebrate only genuinely good news. A milestone earned on a losing period is not a party.
  const won = madeMoney && !wentBadly;
  const unit = report ? (report.days === 7 ? "week" : report.days === 14 ? "fortnight" : report.days >= 28 ? "month" : `${report.days} days`) : "day";

  const acted = picked.filter(p => p !== "no-action");
  const listed = acted.map(p => decisionName(p).toLowerCase());
  const phrase = listed.length > 1 ? `${listed.slice(0, -1).join(", ")} and ${listed[listed.length - 1]}` : listed[0];

  const verdict = (() => {
    const d = phrase ?? decisionName(decision).toLowerCase();
    if (multi && report && acted.length > 1) {
      const avg = Math.round(report.customers / report.days);
      const money = report.profit >= 0 ? `made ${formatINR(Math.round(report.profit))}` : `lost ${formatINR(Math.abs(Math.round(report.profit)))}`;
      return `You chose to ${d}. Over the ${unit} the cafe ${money}, averaging ${avg} customers a day.`;
    }
    if (multi && report) {
      const avg = Math.round(report.customers / report.days);
      const money = report.profit >= 0 ? `made ${formatINR(Math.round(report.profit))}` : `lost ${formatINR(Math.abs(Math.round(report.profit)))}`;
      if (decision === "no-action") return `You held steady for a ${unit}. The cafe ${money}, averaging ${avg} customers a day.`;
      return `You chose to ${d}. Over the ${unit} the cafe ${money}, averaging ${avg} customers a day.`;
    }
    if (decision === "no-action") return dProfit >= 0 ? "You left things alone and the day paid for itself." : "You left things alone and the costs still came.";
    if (spent > 0 && dCustomers > 0) return `You spent ${formatINR(spent)} to ${d}. ${dCustomers} more people came in than yesterday.`;
    if (spent > 0 && dCustomers < 0) return `You spent ${formatINR(spent)} to ${d}, and ${Math.abs(dCustomers)} fewer people came in than yesterday.`;
    if (spent > 0) return `You spent ${formatINR(spent)} to ${d}. Footfall held steady.`;
    if (dCustomers !== 0) return `You chose to ${d}. ${Math.abs(dCustomers)} ${dCustomers > 0 ? "more" : "fewer"} people came in than yesterday.`;
    return `You chose to ${d}.`;
  })();

  return (
    <Modal onClose={onClose}>
      {won && <Confetti />}
      {(report ? report.profit > 0 : after.profit > 0) && (
        <div className="burst" aria-hidden="true">{[0,1,2,3,4,5].map(i => <i key={i} style={{ animationDelay: `${i * 70}ms`, left: `${12 + i * 14}%` }}>₹</i>)}</div>
      )}
      {fresh.length > 0 && (
        <div className="milestone-pop"><b>Milestone{fresh.length > 1 ? "s" : ""}</b><span>{fresh.map(m => MILESTONES[m] ?? m).join(" · ")}</span></div>
      )}
      <div className="eyebrow">{multi && report ? `Days ${report.fromDay}–${report.toDay}` : `Day ${before.day} done`}</div>
      {report?.interrupted && (
        <div className="interrupt">
          <strong>Stopped on day {report.interrupted.day}</strong>
          <span>{report.interrupted.message}</span>
        </div>
      )}
      <h2 className="verdict">{verdict}</h2>

      {multi && report ? (
        <>
          <div className="deltas">
            <div><span>Customers served</span><strong>{report.customers.toLocaleString("en-IN")}</strong><small>over {report.days} days</small></div>
            <div><span>Revenue</span><strong>{formatINR(Math.round(report.revenue))}</strong><small>{formatINR(Math.round(report.revenue / report.days))}/day</small></div>
            <div><span>Profit</span><strong className={cls(report.profit)}>{formatINR(Math.round(report.profit))}</strong><small>{report.profitableDays} good days, {report.lossDays} bad</small></div>
            <div><span>Cash now</span><strong className={cls(after.cash - before.cash)}>{formatINR(after.cash)}</strong><small>{sign(after.cash - before.cash)} this {unit}</small></div>
          </div>
          {(report.bestDay || report.worstDay) && (
            <div className="extremes">
              {report.bestDay && <div><span>Best day</span><strong className="pos">Day {report.bestDay.day}</strong><small>{report.bestDay.customers} customers · {formatINR(report.bestDay.profit)}</small></div>}
              {report.worstDay && <div><span>Worst day</span><strong className="neg">Day {report.worstDay.day}</strong><small>{report.worstDay.customers} customers · {formatINR(report.worstDay.profit)}</small></div>}
            </div>
          )}
        </>
      ) : (
        <div className="deltas">
          <div><span>Customers</span><strong className={cls(dCustomers)}>{sign(dCustomers)}</strong><small>{after.customers} today</small></div>
          <div><span>Profit</span><strong className={cls(dProfit)}>{sign(dProfit)}</strong><small>{formatINR(after.profit)} today</small></div>
          <div><span>Reputation</span><strong className={cls(dRep)}>{sign(dRep)}</strong><small>{Math.round(after.reputation)}/100 now</small></div>
          <div><span>Cash</span><strong className={cls(after.cash - before.cash)}>{sign(after.cash - before.cash)}</strong><small>{formatINR(after.cash)} left</small></div>
        </div>
      )}

      {custSeries.length > 2 && <div className="trend"><span>Customers, last {custSeries.length} days</span><Spark values={custSeries} /></div>}
      {after.lastDayMessage && <p className="daymsg">{after.lastDayMessage}</p>}
      <button className="primary" onClick={onClose}>Carry on</button>
    </Modal>
  );
}

function HistoryModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const items: DayRecord[] = [...state.dayHistory].reverse();
  return (
    <Modal onClose={onClose}>
      <div className="eyebrow">Your journey</div>
      <h2>What you did</h2>
      {items.length === 0 && <p>No finished days yet.</p>}
      <div className="stack">
        {items.map(it => {
          const spend = Math.max(0, it.cashBefore - it.cashAfter + it.profit);
          return (
            <div className="history-row" key={`${it.day}-${it.decision}`}>
              <div className="choice-head">
                <strong>Day {it.day} · {decisionName(it.decision)}</strong>
                <span className={it.profit >= 0 ? "pos" : "neg"}>{formatINR(it.profit)}</span>
              </div>
              <small>{it.customers} customers · stock {Math.round(it.inventory)}% · reputation {Math.round(it.reputation)}%</small>
              <small>{spend > 0 ? `Spent ${formatINR(spend)}` : "Spent nothing"}{it.wastage > 0 ? ` · ${formatINR(it.wastage)} wasted` : ""}</small>
              {it.eventId && <div className="hist-event"><b>{EVENT_NAMES[it.eventId] ?? it.eventId}</b>{it.eventOption ? ` — ${EVENT_CHOICES[it.eventOption] ?? it.eventOption}` : ""}</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function FeedbackModal({ onDone }: { onDone: (a: Record<string, string | boolean | undefined>) => void }) {
  const [a, setA] = useState<Record<string, string>>({});
  const q = (key: string, label: string, opts: string[]) => (
    <div className="fq"><strong>{label}</strong>
      <div className="fq-row">{opts.map(o => (
        <button key={o} className={`pill ${a[key] === o ? "selected" : ""}`} onClick={() => setA({ ...a, [key]: o })}>{o}</button>
      ))}</div>
    </div>
  );
  const [comment, setComment] = useState("");
  const ready = a.ease && a.gameplay && a.decisions && a.continuePlaying;
  return (
    <Modal onClose={() => onDone({ skipped: true })}>
      <Eyebrow>One last thing</Eyebrow>
      <h2>How was it?</h2>
      <p>Thirty seconds. It genuinely shapes what gets built next.</p>
      {q("ease", "Was it clear what to do?", ["Confusing", "Okay", "Clear"])}
      {q("gameplay", "How hard was it?", ["Too easy", "About right", "Too hard"])}
      {q("decisions", "Could you tell what your choices did?", ["Not really", "Sometimes", "Yes"])}
      {q("continuePlaying", "Would you play again?", ["No", "Maybe", "Definitely"])}
      <textarea className="input area" value={comment} maxLength={1000} onChange={e => setComment(e.target.value)} placeholder="Anything you'd change? (optional)" />
      <button className="primary" disabled={!ready} onClick={() => onDone({ ...a, comment })}>Send</button>
      <button className="text-button" onClick={() => onDone({ skipped: true })}>Skip</button>
    </Modal>
  );
}

function Screen({ children }: { children: ReactNode }) { return <main className="shell"><div className="wrap narrow"><section className="card tall">{children}</section></div></main>; }
function Eyebrow({ children }: { children: ReactNode }) { return <div className="eyebrow">{children}</div>; }
function H1({ children }: { children: ReactNode }) { return <h1>{children}</h1>; }
function P({ children }: { children: ReactNode }) { return <p className="lead">{children}</p>; }
function Metric({ label, value, tone, series, onClick }: { label: string; value: string; tone?: "pos" | "neg"; series?: number[]; onClick?: () => void }) {
  const [flash, setFlash] = useState(false);
  useEffect(() => { setFlash(true); const t = setTimeout(() => setFlash(false), 600); return () => clearTimeout(t); }, [value]);
  return <button className={`metric ${flash ? "flash" : ""}`} onClick={onClick} aria-label={`${label}: ${value}. Tap for more detail.`}>
    <span>{label}</span><strong className={tone ?? ""}>{value}</strong>
    {series && series.length > 1 && <Spark values={series} />}
    <i className="tapdot" aria-hidden="true" />
  </button>;
}
function Confetti() {
  const colours = ["var(--amber)", "var(--teal)", "var(--coral)", "var(--violet)", "var(--sky)"];
  return <div className="confetti" aria-hidden="true">
    {Array.from({ length: 22 }).map((_, i) => (
      <i key={i} style={{ left: `${(i * 4.5) % 100}%`, background: colours[i % colours.length], animationDelay: `${(i % 7) * 90}ms` }} />
    ))}
  </div>;
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="sheet">{children}</div>
  </div>;
}
