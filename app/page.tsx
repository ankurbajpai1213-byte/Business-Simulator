"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  FORMAT_OPTIONS, LOCATION_OPTIONS, MENU_ITEMS, STARTER_PRESETS,
  formatINR, getAvailableDecisions,
  type Decision, type GameState, type DayRecord, type StarterPresetId,
} from "@/lib/simulation";

const DECISIONS: Array<[Decision, string, string, string]> = [
  ["marketing", "Run marketing", "Bring more people through the door.", "₹10,000"],
  ["quality", "Improve quality", "Better product, better word of mouth.", "₹12,000"],
  ["inventory", "Restock", "Refill the shelves.", "₹8,000"],
  ["hire", "Hire staff", "Serve more people per day.", "₹18,000"],
  ["raise-price", "Raise prices", "More per sale — if they stay.", "Free"],
  ["lower-price", "Lower prices", "Win back customers you priced out.", "Free"],
  ["no-action", "Do nothing", "Let the day run and watch.", "Free"],
];
const decisionName = (id: Decision) => DECISIONS.find(x => x[0] === id)?.[1] ?? "your decision";

type Screen = "loading" | "welcome" | "cafe-name" | "style" | "game";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [player, setPlayer] = useState<{ id: string; display_name: string } | null>(null);
  const [name, setName] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [preset, setPreset] = useState<StarterPresetId>("steady");
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [eventOption, setEventOption] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ before: GameState; after: GameState; decision: Decision } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
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
    const finished = state.cash <= 0 || state.day >= 91;
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

  const openCafe = async () => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/game/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessName: cafeName.trim(), preset }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to open your cafe.");
      setState(d.state as GameState); setScreen("game");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to open your cafe."); }
    finally { setBusy(false); }
  };

  const finishDay = async () => {
    if (!state || !selected || (state.currentEvent && !eventOption)) return;
    const before = state; const chosen = selected;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/simulate-turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: chosen, eventOption }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to finish the day.");
      const after = d.state as GameState;
      setState(after); setSelected(null); setEventOption(null);
      setSummary({ before, after, decision: chosen });
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to finish the day."); }
    finally { setBusy(false); }
  };

  const newGame = async () => {
    if (!confirm("Start a new game? Your current run stays saved.")) return;
    setBusy(true);
    try {
      const r = await fetch("/api/game/new", { method: "POST" }); const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setState(d.state as GameState); setCafeName(""); setSelected(null); setEventOption(null);
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
      <P>A cafe in Mumbai. Ninety days. Every decision has consequences — and there are no perfect answers.</P>
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
        onChange={e => setCafeName(e.target.value)} onKeyDown={e => e.key === "Enter" && cafeName.trim() && setScreen("style")} placeholder="Brew &amp; Bean" />
      <button className="primary" onClick={() => setScreen("style")} disabled={!cafeName.trim()}>Continue</button>
      <div className="disclaimer">
        <strong>This is a game, not a business prediction tool.</strong>
        <span>It uses simplified economics so you can experiment and see how choices play out. Don&rsquo;t use it as financial or business advice.</span>
      </div>
      {error && <div className="notice">{error}</div>}
    </Screen>
  );

  if (screen === "style") return (
    <Screen>
      <Eyebrow>Step 2 of 2</Eyebrow>
      <H1>{cafeName} opens tomorrow.</H1>
      <P>Pick how you want to start. You can change all of this later, inside the game.</P>
      <div className="stack">
        {STARTER_PRESETS.map(p => {
          const loc = LOCATION_OPTIONS.find(l => l.id === p.location);
          return (
            <button key={p.id} className={`choice-card ${preset === p.id ? "selected" : ""}`} onClick={() => setPreset(p.id)}>
              <div className="choice-head"><strong>{p.name}</strong>{preset === p.id && <span className="tick">Selected</span>}</div>
              <small>{p.blurb}</small>
              <em>{formatINR(p.capital)} to start · {formatINR(loc?.rentMonthly ?? 0)}/month rent</em>
            </button>
          );
        })}
      </div>
      <button className="primary" onClick={openCafe} disabled={busy}>{busy ? "Opening…" : "Open the doors"}</button>
      <button className="text-button" onClick={() => setScreen("cafe-name")}>Back</button>
      {error && <div className="notice">{error}</div>}
    </Screen>
  );

  if (!state) return <Screen><H1>Something went wrong.</H1><P>{error || "Please refresh."}</P></Screen>;

  if (state.cash <= 0 || state.day >= 91) {
    const won = state.day >= 91 && state.cumulativeProfit > 0;
    const survived = state.day >= 91 && !won;
    return (
      <>
        <Screen>
          <Eyebrow>{won ? "You built it" : survived ? "Ninety days" : "Out of cash"}</Eyebrow>
          <H1>{won ? "You made it." : survived ? "You survived." : "The money ran out."}</H1>
          <P>{won ? `${state.businessName || "Your cafe"} reached day 90 in profit. That's a win.`
            : survived ? `${state.businessName || "Your cafe"} lasted ninety days but didn't finish in profit. That's a lesson, not a failure.`
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

  const available = new Set(getAvailableDecisions(state));
  const location = LOCATION_OPTIONS.find(x => x.id === state.location);
  const format = FORMAT_OPTIONS.find(x => x.id === state.format);

  return (
    <main className="shell">
      <div className="wrap">
        <header className="bar">
          <div>
            <div className="cafe">{state.businessName || "Your cafe"}</div>
            <div className="sub">Day {state.day} · {location?.name} · {format?.name}</div>
          </div>
          <div className="bar-actions">
            <button className="ghost" onClick={() => setHistoryOpen(true)}>History</button>
            <button className="ghost" onClick={newGame} disabled={busy}>New</button>
          </div>
        </header>

        <div className="metrics">
          <Metric label="Cash" value={formatINR(state.cash)} />
          <Metric label="Customers yesterday" value={state.customers.toLocaleString("en-IN")} />
          <Metric label="Profit yesterday" value={formatINR(state.profit)} tone={state.profit >= 0 ? "pos" : "neg"} />
          <Metric label="Reputation" value={`${Math.round(state.reputation)}/100`} />
          <Metric label="Stock" value={`${Math.round(state.inventory)}/100`} tone={state.inventory < 20 ? "neg" : undefined} />
          <Metric label="Staff" value={`${state.staff}/100`} />
        </div>

        {state.currentEvent && (
          <section className="card event">
            <Eyebrow>Something happened</Eyebrow>
            <h2>{state.currentEvent.title}</h2>
            <p>{state.currentEvent.narrative}</p>
            <div className="stack">
              {state.currentEvent.options.map(o => (
                <button key={o.id} className={`choice-card ${eventOption === o.id ? "selected" : ""}`} onClick={() => setEventOption(o.id)} disabled={busy}>
                  <div className="choice-head"><strong>{o.title}</strong>{eventOption === o.id && <span className="tick">Chosen</span>}</div>
                  <small>{o.description}</small>
                  <em>{o.cost ? formatINR(o.cost) : "No cost"}</em>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="card">
          <Eyebrow>Today</Eyebrow>
          <h2>How will you run {state.businessName || "the cafe"} today?</h2>
          <div className="stack">
            {DECISIONS.map(([id, title, desc, cost]) => {
              const ok = available.has(id);
              return (
                <button key={id} className={`choice-card ${selected === id ? "selected" : ""} ${!ok ? "locked" : ""}`}
                  onClick={() => ok && setSelected(id)} disabled={busy || !ok}>
                  <div className="choice-head"><strong>{title}</strong>{selected === id && <span className="tick">Chosen</span>}</div>
                  <small>{ok ? desc : "Not available right now"}</small>
                  <em>{cost}</em>
                </button>
              );
            })}
          </div>
          <button className="primary" onClick={finishDay} disabled={busy || !selected || !!(state.currentEvent && !eventOption)}>
            {busy ? "Running the day…" : "Finish the day"}
          </button>
          {error && <div className="notice">{error}</div>}
        </section>
      </div>

      {summary && <DaySummary {...summary} onClose={() => setSummary(null)} />}
      {historyOpen && <HistoryModal state={state} onClose={() => setHistoryOpen(false)} />}
      {feedbackOpen && <FeedbackModal onDone={submitFeedback} />}
    </main>
  );
}

function DaySummary({ before, after, decision, onClose }: { before: GameState; after: GameState; decision: Decision; onClose: () => void }) {
  const dCustomers = after.customers - before.customers;
  const dProfit = after.profit - before.profit;
  const dRep = Math.round((after.reputation - before.reputation) * 10) / 10;
  const spent = Math.max(0, before.cash + after.profit - after.cash);
  const line = (n: number) => (n > 0 ? `+${n.toLocaleString("en-IN")}` : n.toLocaleString("en-IN"));
  return (
    <Modal onClose={onClose}>
      <Eyebrow>Day {before.day} done</Eyebrow>
      <h2>You chose to {decisionName(decision).toLowerCase()}.</h2>
      <p className="lead">{after.lastDayMessage}</p>
      <div className="deltas">
        <div><span>Customers</span><strong className={dCustomers > 0 ? "pos" : dCustomers < 0 ? "neg" : ""}>{line(dCustomers)}</strong><small>{after.customers} came in</small></div>
        <div><span>Profit</span><strong className={dProfit > 0 ? "pos" : dProfit < 0 ? "neg" : ""}>{line(Math.round(dProfit))}</strong><small>{formatINR(after.profit)} today</small></div>
        <div><span>Reputation</span><strong className={dRep > 0 ? "pos" : dRep < 0 ? "neg" : ""}>{line(dRep)}</strong><small>{Math.round(after.reputation)}/100 now</small></div>
        <div><span>Cash</span><strong className={after.cash >= before.cash ? "pos" : "neg"}>{line(after.cash - before.cash)}</strong><small>{formatINR(after.cash)} left</small></div>
      </div>
      {spent > 0 && <p className="spendline">You spent {formatINR(spent)} today.</p>}
      <button className="primary" onClick={onClose}>Next day</button>
    </Modal>
  );
}

function HistoryModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const items: DayRecord[] = [...state.dayHistory].reverse();
  return (
    <Modal onClose={onClose}>
      <Eyebrow>Your journey</Eyebrow>
      <h2>What you did</h2>
      {items.length === 0 && <p>No finished days yet.</p>}
      <div className="stack">
        {items.map(it => (
          <div className="history-row" key={`${it.day}-${it.decision}`}>
            <div className="choice-head"><strong>Day {it.day}</strong><span className={it.profit >= 0 ? "pos" : "neg"}>{formatINR(it.profit)}</span></div>
            <small>{decisionName(it.decision)} · {it.customers} customers · reputation {Math.round(it.reputation)}</small>
          </div>
        ))}
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
function Metric({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  return <div className="metric"><span>{label}</span><strong className={tone ?? ""}>{value}</strong></div>;
}
function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="sheet">{children}</div>
  </div>;
}
