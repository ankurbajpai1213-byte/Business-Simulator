"use client";

import { useState } from "react";
import { INITIAL_STATE, applyDecision, advanceDay, formatINR, type Decision, type GameState } from "@/lib/simulation";

const decisionLabels: Array<[Decision, string, string]> = [
  ["raise-price", "Raise prices", "Increase average ticket, but demand may soften."],
  ["marketing", "Run marketing", "Spend ₹10,000 to attract more customers."],
  ["hire", "Hire staff", "Spend ₹18,000 to improve service capacity."],
  ["quality", "Improve quality", "Spend ₹12,000 on product and experience."],
  ["inventory", "Restock", "Spend ₹8,000 to protect against stockouts."],
];

export default function Home() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [customerMessage, setCustomerMessage] = useState("");
  const [customerReply, setCustomerReply] = useState("A customer is waiting to talk to you.");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const choose = (decision: Decision) => {
    setSelected(decision);
    setState((current) => applyDecision(current, decision));
  };

  const endDay = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/simulate-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, decision: selected || "inventory" }),
      });
      const data = await response.json();
      if (response.ok) setState(data.state);
      setSelected(null);
    } finally {
      setBusy(false);
    }
  };

  const talkToCustomer = async () => {
    if (!customerMessage.trim()) return;
    setBusy(true);
    try {
      const response = await fetch("/api/ai/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerMessage: customerMessage, businessContext: `Day ${state.day}, reputation ${state.reputation}/100` }),
      });
      const data = await response.json();
      setCustomerReply(data.message || data.error || "The customer has nothing more to say.");
      setCustomerMessage("");
    } finally {
      setBusy(false);
    }
  };

  const submitFeedback = async (rating: number) => {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, replay: rating >= 4, realism: 3, difficulty: 3, sessionDays: state.day }),
    });
    setFeedbackSent(true);
  };

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
                <button key={id} className="action" onClick={() => choose(id)}>
                  <strong>{selected === id ? "✓ " : ""}{title}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
            <div className="notice">Selected action: <strong>{selected ? decisionLabels.find(([id]) => id === selected)?.[1] : "none"}</strong>. Your choice is applied by the simulation before the day ends.</div>
            <button className="primary" onClick={endDay} disabled={busy}>{busy ? "Processing…" : "End day →"}</button>
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
            <div className="notice">Your objective: become profitable and survive as long as possible. Bankruptcy occurs when cash reaches zero.</div>
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

        <div className="footer">Prototype v0.1 • Server-side simulation boundary • OpenAI and Supabase are configured through environment secrets.</div>
      </div>
    </main>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <div className="panel"><div className="metric-label">{label}</div><div className={`metric-value ${good ? "good" : ""}`}>{value}</div></div>;
}
