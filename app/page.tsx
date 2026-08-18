"use client";

import { useEffect, useState } from "react";
import { INITIAL_STATE, formatINR, type Decision, type GameState } from "@/lib/simulation";

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
  const [customerMessage, setCustomerMessage] = useState("");
  const [customerReply, setCustomerReply] = useState("A customer is waiting to talk to you.");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/game/session")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to start game.");
        setState(data.state as GameState);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const endDay = async () => {
    if (!state || !selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/simulate-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: selected }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to advance simulation.");
      setState(data.state as GameState);
      setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to advance simulation.");
    } finally {
      setBusy(false);
    }
  };

  const talkToCustomer = async () => {
    if (!state || !customerMessage.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/ai/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerMessage: customerMessage,
          businessContext: `Day ${state.day}, cash ${formatINR(state.cash)}, reputation ${state.reputation}/100, Mumbai cafe`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI interaction failed.");
      setCustomerReply(data.message || "The customer has nothing more to say.");
      setCustomerMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI interaction failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitFeedback = async (rating: number) => {
    if (!state) return;
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, replay: rating >= 4, realism: 3, difficulty: 3, sessionDays: state.day }),
    });
    if (response.ok) setFeedbackSent(true);
  };

  if (!state) {
    return (
      <main className="shell">
        <div className="container">
          <section className="hero">
            <div className="badge">BUSINESS SIMULATOR • PROTOTYPE</div>
            <h1>Starting your Mumbai café…</h1>
            <p>{error || "Creating a secure server-side game session."}</p>
            {error && <button className="primary" onClick={() => window.location.reload()}>Try again</button>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="container">
        <div className="topbar">
          <div className="brand">Business Simulator</div>
          <div className="badge">Mumbai • Café • Prototype</div>
        </div>

        <section className="hero">
          <div className="badge">DAY {state.day}</div>
          <h1>Can you build a café that survives Mumbai?</h1>
          <p>Every day is a decision. Manage cash, demand, staff and reputation. The simulation engine owns the numbers; AI brings the people to life.</p>
          {error && <div className="notice">{error}</div>}
        </section>

        <section className="grid metrics">
          <Metric label="Cash" value={formatINR(state.cash)} />
          <Metric label="Today's revenue" value={formatINR(state.revenue)} />
          <Metric label="Today's profit" value={formatINR(state.profit)} good={state.profit >= 0} />
          <Metric label="Customers" value={state.customers.toLocaleString("en-IN")} />
          <Metric label="Reputation" value={`${state.reputation}/100`} />
        </section>

        <div className="grid main-grid">
          <section className="panel">
            <h2 className="section-title">What will you do today?</h2>
            <div className="actions">
              {decisionLabels.map(([id, title, description]) => (
                <button key={id} className="action" onClick={() => setSelected(id)} disabled={busy}>
                  <strong>{selected === id ? "✓ " : ""}{title}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
            <div className="notice">Selected action: <strong>{selected ? decisionLabels.find(([id]) => id === selected)?.[1] : "none"}</strong>. The server loads your saved state and applies the decision.</div>
            <button className="primary" onClick={endDay} disabled={busy || !selected}>{busy ? "Processing…" : "End day →"}</button>
          </section>

          <section className="panel">
            <h2 className="section-title">Mumbai market</h2>
            <div className="market">
              <div className="market-row"><span>Location</span><strong>High-footfall</strong></div>
              <div className="market-row"><span>Customer demand</span><strong>{Math.round(state.reputation * 0.7 + state.quality * 0.3)}/100</strong></div>
              <div className="market-row"><span>Service capacity</span><strong>{state.staff}/100</strong></div>
              <div className="market-row"><span>Product quality</span><strong>{state.quality}/100</strong></div>
              <div className="market-row"><span>Inventory health</span><strong>{state.inventory}/100</strong></div>
            </div>
            <div className="notice">Objective: become profitable and survive as long as possible.</div>
          </section>
        </div>

        <div className="grid main-grid">
          <section className="panel chat">
            <h2 className="section-title">Customer interaction</h2>
            <div className="chat-box">{customerReply}</div>
            <textarea value={customerMessage} onChange={(e) => setCustomerMessage(e.target.value)} placeholder="Respond to the customer…" maxLength={1200} />
            <button className="primary" onClick={talkToCustomer} disabled={busy || !customerMessage.trim()}>Talk to customer</button>
          </section>

          <section className="panel">
            <h2 className="section-title">Run feedback</h2>
            <p>Feedback is part of the prototype. We want to learn whether the simulation is actually fun.</p>
            {!feedbackOpen ? <button className="primary" onClick={() => setFeedbackOpen(true)}>Rate this run</button> : feedbackSent ? <div className="notice">Thanks. Your feedback has been recorded for the prototype.</div> : <div className="actions">{[1,2,3,4,5].map((rating) => <button key={rating} className="action" onClick={() => submitFeedback(rating)}><strong>{rating}/5</strong><small>{rating === 5 ? "Loved it" : rating === 1 ? "Not for me" : ""}</small></button>)}</div>}
          </section>
        </div>

        <div className="footer">Prototype v0.1 • Server-authoritative simulation • OpenAI and Supabase credentials stay server-side.</div>
      </div>
    </main>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <div className="panel"><div className="metric-label">{label}</div><div className={`metric-value ${good ? "good" : ""}`}>{value}</div></div>;
}
