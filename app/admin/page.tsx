"use client";

import { useEffect, useMemo, useState } from "react";

type Player = { id:string; display_name:string; created_at:string; last_seen_at:string };
type Session = { id:string; player_id:string|null; status:string; city:string; business_type:string; state:any; created_at:string; updated_at:string };
type Event = { session_id:string; day:number; event_type:string; payload:any; created_at:string };
type Feedback = { player_id:string|null; session_id:string|null; day:number; ease:string|null; gameplay:string|null; realism:string|null; decisions:string|null; continue_playing:string|null; comment:string|null; skipped:boolean; created_at:string };

const money = (n:any) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const time = (s:string) => new Date(s).toLocaleString();

export default function AdminPage() {
  const [token,setToken] = useState("");
  const [players,setPlayers] = useState<Player[]>([]);
  const [sessions,setSessions] = useState<Session[]>([]);
  const [events,setEvents] = useState<Event[]>([]);
  const [feedback,setFeedback] = useState<Feedback[]>([]);
  const [selected,setSelected] = useState<string|null>(null);
  const [error,setError] = useState("");
  const load = async () => {
    setError("");
    const r = await fetch("/api/admin/players", { headers:{"x-admin-token":token} });
    const j = await r.json();
    if (!r.ok) return setError(j.error || "Unable to load dashboard");
    setPlayers(j.players); setSessions(j.sessions); setEvents(j.events); setFeedback(j.feedback);
    if (!selected && j.players[0]) setSelected(j.players[0].id);
  };
  const current = players.find(p=>p.id===selected);
  const ps = useMemo(()=>sessions.filter(s=>s.player_id===selected),[sessions,selected]);
  const es = useMemo(()=>events.filter(e=>ps.some(s=>s.id===e.session_id)).sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at)),[events,ps]);
  const fs = useMemo(()=>feedback.filter(f=>f.player_id===selected),[feedback,selected]);
  const latest = ps[0];
  const state = latest?.state || {};
  if (!token || !players.length) return <main style={{padding:32,fontFamily:"system-ui",maxWidth:700,margin:"auto"}}><h1>Business Simulator Admin</h1><p>Enter the admin dashboard token.</p><input value={token} onChange={e=>setToken(e.target.value)} type="password" placeholder="Admin token" style={{padding:12,width:"100%",boxSizing:"border-box"}}/><button onClick={load} style={{marginTop:12,padding:"12px 20px"}}>Open dashboard</button>{error&&<p style={{color:"crimson"}}>{error}</p>}</main>;
  return <main style={{padding:24,fontFamily:"system-ui",maxWidth:1200,margin:"auto"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h1>Player Analytics</h1><p>Player → sessions → events → feedback</p></div><button onClick={load}>Refresh</button></header>
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
      <aside style={{border:"1px solid #ddd",borderRadius:12,padding:12}}><h3>Players ({players.length})</h3>{players.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} style={{display:"block",width:"100%",textAlign:"left",padding:12,marginBottom:6,border: selected===p.id?"2px solid #111":"1px solid #ddd",borderRadius:8,background:"white"}}><b>{p.display_name}</b><br/><small>Last seen {time(p.last_seen_at)}</small></button>)}</aside>
      <section>{current ? <><h2>{current.display_name}</h2><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{[["Status",latest?.status||"—"],["Current day",state.day||"—"],["Cash",money(state.cash)],["Sessions",ps.length]].map(([a,b])=><div key={a as string} style={{border:"1px solid #ddd",borderRadius:10,padding:14}}><small>{a}</small><div style={{fontSize:22,fontWeight:700}}>{b}</div></div>)}</div><h3>Game timeline</h3><div>{es.map((e,i)=><article key={i} style={{borderLeft:"3px solid #111",padding:"10px 14px",marginBottom:10}}><b>Day {e.day} · {e.event_type}</b><small style={{float:"right"}}>{time(e.created_at)}</small><pre style={{whiteSpace:"pre-wrap",fontSize:12,background:"#f6f6f6",padding:10,borderRadius:8}}>{JSON.stringify(e.payload,null,2)}</pre></article>)}</div><h3>Feedback</h3>{fs.map((f,i)=><article key={i} style={{padding:12,border:"1px solid #ddd",borderRadius:8,marginBottom:8}}><b>Day {f.day}</b> · {f.continue_playing||""}<p>{f.comment||"No comment"}</p><small>{time(f.created_at)}</small></article>)}</> : <p>Select a player.</p>}</section>
    </div>
  </main>;
}
