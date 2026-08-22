"use client";

import { useCallback, useEffect, useState } from "react";

type PlayerRow = { id: string; display_name: string; created_at: string; last_seen_at: string; sessions: number; lastDay: number };
type Session = { id: string; status: string; city: string; business_type: string; state: Record<string, unknown>; created_at: string; updated_at: string };
type GameEvent = { session_id: string; day: number; event_type: string; payload: Record<string, unknown>; created_at: string };
type Feedback = { session_id: string | null; day: number; ease: string | null; gameplay: string | null; realism: string | null; decisions: string | null; continue_playing: string | null; comment: string | null; skipped: boolean; created_at: string };

const KEY = "bs-admin-token";
const money = (n: unknown) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const when = (s: string) => new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Admin() {
  const [token, setToken] = useState("");
  const [entry, setEntry] = useState("");
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [orphaned, setOrphaned] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ player: PlayerRow; sessions: Session[]; events: GameEvent[]; feedback: Feedback[]; hasMore: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { const t = sessionStorage.getItem(KEY); if (t) setToken(t); }, []);

  const call = useCallback(async (path: string) => {
    const r = await fetch(path, { headers: { "x-admin-token": token } });
    if (r.status === 401) { setToken(""); sessionStorage.removeItem(KEY); throw new Error("That token was not accepted."); }
    if (!r.ok) throw new Error("Could not load the data.");
    return r.json();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setBusy(true); setError("");
    call("/api/admin/players")
      .then(d => { setPlayers(d.players); setOrphaned(d.orphanedSessions); })
      .catch(e => setError(e.message))
      .finally(() => setBusy(false));
  }, [token, call]);

  useEffect(() => {
    if (!token || !selected) { setDetail(null); return; }
    setBusy(true); setError("");
    call(`/api/admin/players?playerId=${selected}`)
      .then(setDetail).catch(e => setError(e.message)).finally(() => setBusy(false));
  }, [token, selected, call]);

  if (!token) return (
    <main className="ad">
      <h1>Business Simulator admin</h1>
      <p className="ad-muted">Enter the dashboard token.</p>
      <input className="ad-input" type="password" value={entry} placeholder="Admin token"
        onChange={e => setEntry(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && entry.trim()) { sessionStorage.setItem(KEY, entry.trim()); setToken(entry.trim()); } }} />
      <button className="ad-btn" disabled={!entry.trim()}
        onClick={() => { sessionStorage.setItem(KEY, entry.trim()); setToken(entry.trim()); }}>Open dashboard</button>
      {error && <p className="ad-error">{error}</p>}
    </main>
  );

  return (
    <main className="ad ad-wide">
      <header className="ad-top">
        <h1>Players</h1>
        <div>
          {orphaned > 0 && <span className="ad-pill">{orphaned} unlinked session{orphaned === 1 ? "" : "s"}</span>}
          <button className="ad-link" onClick={() => { sessionStorage.removeItem(KEY); setToken(""); setSelected(null); }}>Sign out</button>
        </div>
      </header>
      {error && <p className="ad-error">{error}</p>}

      <div className="ad-cols">
        <aside className="ad-list">
          {players.length === 0 && !busy && <p className="ad-muted">No players yet.</p>}
          {players.map(p => (
            <button key={p.id} className={`ad-row ${selected === p.id ? "on" : ""}`} onClick={() => setSelected(p.id)}>
              <strong>{p.display_name}</strong>
              <span>{p.sessions} run{p.sessions === 1 ? "" : "s"} · day {p.lastDay} · {when(p.last_seen_at)}</span>
            </button>
          ))}
        </aside>

        <section className="ad-detail">
          {busy && <p className="ad-muted">Loading…</p>}
          {!selected && !busy && <p className="ad-muted">Choose a player to see everything they have done.</p>}
          {detail && (
            <>
              <h2>{detail.player.display_name}</h2>
              <p className="ad-muted">First seen {when(detail.player.created_at)} · last active {when(detail.player.last_seen_at)}</p>

              {detail.sessions.map(s => {
                const st = s.state as Record<string, unknown>;
                const evs = detail.events.filter(e => e.session_id === s.id);
                return (
                  <div className="ad-card" key={s.id}>
                    <div className="ad-card-top">
                      <strong>{String(st.businessName || "Unnamed cafe")}</strong>
                      <span className={`ad-tag ${s.status}`}>{s.status}</span>
                    </div>
                    <div className="ad-stats">
                      <div><span>Day</span><b>{String(st.day ?? "—")}</b></div>
                      <div><span>Cash</span><b>{money(st.cash)}</b></div>
                      <div><span>Profit</span><b>{money(st.cumulativeProfit)}</b></div>
                      <div><span>Reputation</span><b>{Math.round(Number(st.reputation) || 0)}%</b></div>
                      <div><span>Supplies</span><b>{Math.round(Number(st.inventory) || 0)}%</b></div>
                      <div><span>Served</span><b>{Number(st.totalCustomers ?? 0).toLocaleString("en-IN")}</b></div>
                    </div>
                    <div className="ad-muted ad-small">Started {when(s.created_at)} · last turn {when(s.updated_at)} · {evs.length} events</div>

                    <details>
                      <summary>Timeline</summary>
                      <table className="ad-table">
                        <thead><tr><th>Day</th><th>What happened</th><th>Customers</th><th>Profit</th><th>When</th></tr></thead>
                        <tbody>
                          {evs.map((e, i) => {
                            const p = e.payload as Record<string, unknown>;
                            return (
                              <tr key={`${e.session_id}-${e.created_at}-${i}`}>
                                <td>{e.day}</td>
                                <td>{String(p.decision ?? e.event_type).replace(/-/g, " ")}</td>
                                <td>{p.customers !== undefined ? String(p.customers) : "—"}</td>
                                <td className={Number(p.profit) < 0 ? "neg" : ""}>{p.profit !== undefined ? money(p.profit) : "—"}</td>
                                <td>{when(e.created_at)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </details>
                  </div>
                );
              })}

              {detail.hasMore && <p className="ad-muted ad-small">Older events not shown — this player has more history than one page.</p>}

              {detail.feedback.length > 0 && (
                <div className="ad-card">
                  <strong>Feedback</strong>
                  {detail.feedback.map((f, i) => (
                    <div className="ad-fb" key={i}>
                      <span>Day {f.day} · {when(f.created_at)}{f.skipped ? " · skipped" : ""}</span>
                      {!f.skipped && <b>{[f.ease, f.gameplay, f.decisions, f.continue_playing].filter(Boolean).join(" · ")}</b>}
                      {f.comment && <em>{f.comment}</em>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
