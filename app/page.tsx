"use client";

import { useEffect, useState, type ReactNode } from "react";
import Setup from "@/components/Setup";
import { CafeScene, DecisionIcon, Spark } from "@/components/Art";
import { RUN_LENGTH_DAYS, periodName, slotsForTurn, stageFor, turnLabel, type SpanReport } from "@/lib/cadence";
import {
  FORMAT_OPTIONS, LOCATION_OPTIONS,
  formatINR, getAvailableDecisions,
  type BusinessFormat, type Decision, type GameState, type DayRecord,
  type Location, type MenuItemId,
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
  const location = LOCATION_OPTIONS.find(x => x.id === state.location);
  const format = FORMAT_OPTIONS.find(x => x.id === state.format);

  return (
    <main className="shell">
      <div className="wrap game-wrap">
        <header className="bar">
          <div>
            <div className="cafe">{state.businessName || "Your cafe"}</div>
            <div className="sub">{turnLabel(state.day)} · {stageFor(state.day).label}</div>
          </div>
          <div className="bar-actions">
            <button className="ghost" onClick={() => setHistoryOpen(true)}>History</button>
            <button className="ghost" onClick={newGame} disabled={busy}>New</button>
          </div>
        </header>

        <CafeScene format={state.format} busy={state.serviceCapacity > 0 ? state.customers / state.serviceCapacity : 0} raining={state.currentEvent?.id === "rain"} />

        <div className="metrics">
          <Metric label="Cash" value={formatINR(state.cash)} series={series("cash")} />
          <Metric label="Customers" value={state.customers.toLocaleString("en-IN")} series={series("customers")} />
          <Metric label="Profit" value={formatINR(state.profit)} tone={state.profit >= 0 ? "pos" : "neg"} series={series("profit")} />
          <Metric label="Reputation" value={`${Math.round(state.reputation)}/100`} series={series("reputation")} />
          <Metric label="Stock" value={`${Math.round(state.inventory)}/100`} tone={state.inventory < 20 ? "neg" : undefined} series={series("inventory")} />
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

        <section className="card play-card">
          <div className="play-head">
          <Eyebrow>{turnLabel(state.day)}</Eyebrow>
          <h2>{stageFor(state.day).id === "daily" ? `How will you run ${state.businessName || "the cafe"} today?` : `What\u2019s your plan for the next ${periodName(state.day)}?`}</h2>
          <div className="slotline">
            {slots > 1
              ? <>Choose up to <strong>{slots}</strong> things to do this {periodName(state.day)}. {picked.length} chosen.</>
              : <>Choose <strong>one</strong> thing to do today.</>}
          </div>
          </div>
          <div className="dec-grid">
            {DECISIONS.map(([id, title, desc, cost]) => {
              const on = picked.includes(id);
              const blockedByPrice = (id === "raise-price" && picked.includes("lower-price")) || (id === "lower-price" && picked.includes("raise-price"));
              const full = !on && picked.length >= slots;
              const ok = available.has(id) && !blockedByPrice && !full;
              const why = !available.has(id) ? "Not available right now" : blockedByPrice ? "You already changed prices this turn" : full ? "No slots left this turn" : desc;
              return (
                <button key={id} className={`choice-card dec ${on ? "selected" : ""} ${!ok && !on ? "locked" : ""}`}
                  onClick={() => { if (on) setPicked(p => p.filter(x => x !== id)); else if (ok) setPicked(p => [...p, id]); }}
                  disabled={busy || (!ok && !on)}>
                  <DecisionIcon id={id} />
                  <div className="dec-text">
                    <div className="choice-head"><strong>{title}</strong>{on && <span className="tick">✓</span>}</div>
                    <small>{on ? desc : why}</small>
                  </div>
                  <span className="dec-cost">{cost}</span>
                </button>
              );
            })}
          </div>
          <button className="primary" onClick={finishDay} disabled={busy || picked.length === 0 || !!(state.currentEvent && !eventOption)}>
            {busy ? "Playing it out…" : stageFor(state.day).id === "daily" ? "Finish the day" : `Run the ${periodName(state.day)}`}
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

function DaySummary({ before, after, decision, picked, report, onClose }: { before: GameState; after: GameState; decision: Decision; picked: Decision[]; report?: SpanReport; onClose: () => void }) {
  const multi = !!report && report.days > 1;
  const dCustomers = after.customers - before.customers;
  const dProfit = Math.round(after.profit - before.profit);
  const dRep = Math.round((after.reputation - before.reputation) * 10) / 10;
  const spent = Math.max(0, before.cash + (report ? report.profit : after.profit) - after.cash);
  const sign = (n: number) => (n > 0 ? `+${n.toLocaleString("en-IN")}` : n.toLocaleString("en-IN"));
  const cls = (n: number) => (n > 0 ? "pos" : n < 0 ? "neg" : "");
  const custSeries = [...after.dayHistory.slice(-14).map(r => r.customers)];
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
      <div className="eyebrow">{multi && report ? `Days ${report.fromDay}–${report.toDay}` : `Day ${before.day} done`}</div>
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
function Metric({ label, value, tone, series }: { label: string; value: string; tone?: "pos" | "neg"; series?: number[] }) {
  return <div className="metric"><span>{label}</span><strong className={tone ?? ""}>{value}</strong>{series && series.length > 1 && <Spark values={series} />}</div>;
}
function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="sheet">{children}</div>
  </div>;
}
