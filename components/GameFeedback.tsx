"use client";

import { useEffect, useState } from "react";

/**
 * Always-available feedback about the game itself — not the cafe's customers.
 *
 * Most players never finish a run, so the end-of-run questionnaire never reaches
 * them. This button does. Guests also see a gentle prompt about keeping their
 * progress, timed to moments rather than a clock, so it never interrupts a decision.
 */
export default function GameFeedback({ guest, stage, day }: { guest: boolean; stage: string; day: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [nudge, setNudge] = useState(false);

  // Guests are reminded at natural pauses: end of the first week, then monthly.
  useEffect(() => {
    if (!guest) return;
    const marks = [8, 31, 91, 181];
    if (!marks.includes(day)) return;
    if (sessionStorage.getItem(`bs-guest-nudge-${day}`)) return;
    sessionStorage.setItem(`bs-guest-nudge-${day}`, "1");
    setNudge(true);
    const t = setTimeout(() => setNudge(false), 9000);
    return () => clearTimeout(t);
  }, [guest, day]);

  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/game-feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: rating || null, message: message.trim(), context: { stage, day } }),
      });
      if (r.ok) { setSent(true); setMessage(""); }
    } finally { setSending(false); }
  };

  return (
    <>
      <button className="fb-fab" onClick={() => { setOpen(true); setSent(false); }} aria-label="Send feedback about the game">💬</button>

      {nudge && (
        <div className="guest-nudge" role="status">
          <strong>You are playing as a guest.</strong>
          <span>Sign in and this cafe, and everything you have earned, will still be here next time.</span>
          <button className="text-button" onClick={() => setNudge(false)}>Later</button>
        </div>
      )}

      {open && (
        <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="sheet">
            <div className="eyebrow">About the game</div>
            <h2>What would you change?</h2>
            <p className="detail-what">This goes to the person building it — not to your cafe&rsquo;s customers.</p>
            <div className="fb-stars">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className={`pill ${rating >= n ? "selected" : ""}`} onClick={() => setRating(n)}>{n}★</button>
              ))}
            </div>
            <textarea className="input area" rows={5} value={message} maxLength={4000}
              onChange={e => setMessage(e.target.value)}
              placeholder="What did you enjoy, what confused you, what should change?" />
            {sent && <p className="daymsg">Thank you — that has been recorded.</p>}
            <button className="primary" disabled={!message.trim() || sending} onClick={send}>
              {sending ? "Sending…" : "Send"}
            </button>
            <button className="text-button" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
