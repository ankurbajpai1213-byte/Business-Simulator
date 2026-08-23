"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

const STAGES = [
  { id: "founder", label: "Founder", description: "Build your first business." },
  { id: "operator", label: "Operator", description: "Prove you can run a business consistently." },
  { id: "manager", label: "Manager", description: "Learn to delegate and manage through people." },
  { id: "multi", label: "Multi-business Owner", description: "Successfully manage multiple businesses." },
  { id: "portfolio", label: "Portfolio Manager", description: "Allocate capital, people and attention across businesses." },
] as const;

type GameState = { setupComplete?: boolean; day?: number; reputation?: number; cumulativeProfit?: number; manager?: boolean; milestones?: string[] };

function deriveStage(state: GameState | null) {
  if (!state?.setupComplete) return 0;
  const reputation = state.reputation ?? 0;
  const profit = state.cumulativeProfit ?? 0;
  const milestones = new Set(state.milestones ?? []);
  if (milestones.has("portfolio-manager") || milestones.has("portfolio")) return 4;
  if (milestones.has("multi-business") || milestones.has("business-2")) return 3;
  if (state.manager || milestones.has("manager-hired")) return 2;
  if ((state.day ?? 1) >= 30 && reputation >= 60 && profit > 0) return 1;
  return 0;
}

export default function ProgressionDockV2() {
  const [state, setState] = useState<GameState | null>(null);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const r = await fetch("/api/game/session", { cache: "no-store" });
        const d = await r.json();
        if (active && r.ok) setState(d.state ?? null);
      } catch {}
    };
    load();
    const timer = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const current = deriveStage(state);
  const next = STAGES[Math.min(current + 1, STAGES.length - 1)];
  const progress = useMemo(() => current === 4 ? 100 : Math.min(95, Math.max(8, Math.round((((state?.day ?? 1) % 30) / 30) * 70 + (state?.reputation ?? 50) * 0.2))), [current, state]);

  async function sendFeedback() {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: rating || null, message: message.trim(), context: { stage: STAGES[current].label, day: state?.day ?? null } }) });
      if (!r.ok) throw new Error("Unable to send feedback");
      setSent(true); setMessage("");
    } catch { setSent(false); }
    finally { setSending(false); }
  }

  if (!state?.setupComplete) return null;

  return <>
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 80, fontFamily: "inherit" }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => setFeedback(true)} style={buttonStyle}>💬 Feedback</button>
        <button onClick={() => setOpen(v => !v)} style={buttonStyle}>{STAGES[current].label} · Journey</button>
      </div>
      {open && <div style={panelStyle}>
        <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", opacity: .65 }}>Your business journey</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{STAGES[current].label}</div>
        <div style={{ fontSize: 13, opacity: .72, marginTop: 4 }}>{STAGES[current].description}</div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(0,0,0,.10)", margin: "14px 0" }}><div style={{ width: `${progress}%`, height: "100%", borderRadius: 999, background: "currentColor" }} /></div>
        {STAGES.map((stage, i) => <div key={stage.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", opacity: i <= current ? 1 : .45 }}><span style={{ width: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center", border: "1px solid currentColor", fontSize: 11 }}>{i < current ? "✓" : i === current ? "•" : i + 1}</span><div><strong>{stage.label}</strong><div style={{ fontSize: 11, opacity: .7 }}>{stage.description}</div></div></div>)}
        {current < 4 && <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(0,0,0,.05)", fontSize: 12 }}><strong>Next:</strong> {next.label}</div>}
      </div>}
    </div>

    {feedback && <div onClick={() => setFeedback(false)} style={backdropStyle}><div onClick={e => e.stopPropagation()} style={{ ...panelStyle, width: "min(460px, calc(100vw - 32px))" }}>
      <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", opacity: .65 }}>Game feedback</div>
      <h2 style={{ margin: "6px 0 4px" }}>Help us improve the game</h2>
      <p style={{ marginTop: 0, opacity: .7, fontSize: 13 }}>This is feedback about Business Simulator itself, not your café's customer feedback.</p>
      <div style={{ display: "flex", gap: 6, margin: "14px 0" }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ ...buttonStyle, opacity: rating >= n ? 1 : .45 }}>{n}★</button>)}</div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="What did you enjoy, what was confusing, and what should we change?" rows={6} style={{ width: "100%", boxSizing: "border-box", borderRadius: 12, padding: 12, border: "1px solid rgba(0,0,0,.14)", font: "inherit", resize: "vertical" }} />
      {sent && <div style={{ marginTop: 8, fontSize: 13 }}>Thanks — your feedback has been recorded.</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}><button onClick={() => setFeedback(false)} style={buttonStyle}>Close</button><button onClick={sendFeedback} disabled={!message.trim() || sending} style={{ ...buttonStyle, fontWeight: 800 }}>{sending ? "Sending…" : "Send feedback"}</button></div>
    </div></div>}
  </>;
}

const buttonStyle: CSSProperties = { border: "1px solid rgba(0,0,0,.14)", background: "rgba(255,255,255,.92)", borderRadius: 999, padding: "8px 12px", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.08)" };
const panelStyle: CSSProperties = { background: "rgba(255,255,255,.97)", color: "#171717", border: "1px solid rgba(0,0,0,.12)", borderRadius: 18, padding: 18, boxShadow: "0 18px 50px rgba(0,0,0,.18)", width: 340, maxWidth: "calc(100vw - 32px)" };
const backdropStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(0,0,0,.42)", padding: 16 };
