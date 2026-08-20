import type { ReactNode } from "react";

/* Inline SVG illustrations. No external assets, themed by CSS vars. */

export function CapitalArt({ level }: { level: number }) {
  // level 0..4 -> how full the jar is
  const fill = 18 + level * 16;
  return (
    <svg className="art art-capital" viewBox="0 0 120 100" role="img" aria-label="Money in a jar">
      <defs>
        <clipPath id="jarClip"><path d="M32 34 h56 a4 4 0 0 1 4 4 v46 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-46 a4 4 0 0 1 4 -4 z" /></clipPath>
      </defs>
      {[0,1,2].map(i => (
        <g key={i} className={`coin coin-${i}`}>
          <circle cx={44 + i * 16} cy="14" r="7" className="coin-body" />
          <text x={44 + i * 16} y="18" className="coin-mark" textAnchor="middle">₹</text>
        </g>
      ))}
      <rect x="28" y="26" width="64" height="9" rx="4" className="jar-lid" />
      <path d="M32 34 h56 a4 4 0 0 1 4 4 v46 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-46 a4 4 0 0 1 4 -4 z" className="jar-glass" />
      <g clipPath="url(#jarClip)">
        <rect x="28" y={92 - fill} width="64" height={fill} className="jar-fill">
          <animate attributeName="y" from="92" to={92 - fill} dur="0.5s" fill="freeze" />
          <animate attributeName="height" from="0" to={fill} dur="0.5s" fill="freeze" />
        </rect>
      </g>
      <path d="M32 34 h56 a4 4 0 0 1 4 4 v46 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-46 a4 4 0 0 1 4 -4 z" className="jar-outline" />
    </svg>
  );
}

export function LocationArt({ id }: { id: string }) {
  if (id === "residential") return (
    <svg className="art-icon" viewBox="0 0 64 48" role="img" aria-label="Quiet residential street">
      <rect x="4" y="20" width="16" height="22" className="bld-soft" rx="2" />
      <rect x="24" y="12" width="16" height="30" className="bld-main" rx="2" />
      <rect x="44" y="24" width="16" height="18" className="bld-soft" rx="2" />
      <rect x="28" y="28" width="8" height="14" className="door" rx="1" />
      <circle cx="14" cy="16" r="5" className="tree" /><circle cx="52" cy="19" r="4" className="tree" />
      <rect x="0" y="42" width="64" height="6" className="road" />
    </svg>
  );
  if (id === "premium") return (
    <svg className="art-icon" viewBox="0 0 64 48" role="img" aria-label="Premium district">
      <rect x="6" y="6" width="14" height="36" className="bld-soft" rx="2" />
      <rect x="25" y="10" width="15" height="32" className="bld-main" rx="2" />
      <rect x="45" y="4" width="14" height="38" className="bld-soft" rx="2" />
      <rect x="29" y="28" width="7" height="14" className="door" rx="1" />
      {[12,18,24].map(y => <rect key={y} x="28" y={y} width="9" height="3" className="win" rx="1" />)}
      <path d="M25 10 l7 -6 l8 6 z" className="awning" />
      <rect x="0" y="42" width="64" height="6" className="road" />
    </svg>
  );
  return (
    <svg className="art-icon" viewBox="0 0 64 48" role="img" aria-label="Busy high street">
      <rect x="2" y="14" width="13" height="28" className="bld-soft" rx="2" />
      <rect x="18" y="9" width="17" height="33" className="bld-main" rx="2" />
      <rect x="38" y="16" width="12" height="26" className="bld-soft" rx="2" />
      <rect x="52" y="12" width="11" height="30" className="bld-soft" rx="2" />
      <rect x="23" y="27" width="8" height="15" className="door" rx="1" />
      <path d="M18 20 h17 v5 h-17 z" className="awning" />
      {[8,16,24,32,40,48,56].map(x => <circle key={x} cx={x} cy="45" r="2" className="crowd" />)}
      <rect x="0" y="42" width="64" height="6" className="road" />
    </svg>
  );
}

export function FormatArt({ id }: { id: string }) {
  if (id === "takeaway") return (
    <svg className="art-icon" viewBox="0 0 64 48" role="img" aria-label="Takeaway kiosk layout">
      <rect x="14" y="14" width="36" height="24" className="bld-main" rx="3" />
      <rect x="14" y="22" width="36" height="4" className="counter" />
      <path d="M12 14 h40 l-4 -6 h-32 z" className="awning" />
      <circle cx="32" cy="31" r="3" className="win" />
      <rect x="0" y="38" width="64" height="4" className="road" />
    </svg>
  );
  if (id === "full-cafe") return (
    <svg className="art-icon" viewBox="0 0 64 48" role="img" aria-label="Full service restaurant layout">
      <rect x="5" y="8" width="54" height="30" className="bld-main" rx="3" />
      <rect x="5" y="8" width="54" height="6" className="awning" />
      {[[16,22],[32,22],[48,22],[16,31],[32,31],[48,31]].map(([x,y],i) => (
        <g key={i}><circle cx={x} cy={y} r="4" className="table" /><circle cx={x} cy={y} r="1.6" className="win" /></g>
      ))}
      <rect x="5" y="34" width="54" height="4" className="counter" />
      <rect x="0" y="38" width="64" height="4" className="road" />
    </svg>
  );
  return (
    <svg className="art-icon" viewBox="0 0 64 48" role="img" aria-label="Small cafe layout">
      <rect x="9" y="11" width="46" height="27" className="bld-main" rx="3" />
      <rect x="9" y="11" width="46" height="5" className="awning" />
      {[[20,25],[38,25],[20,33],[38,33]].map(([x,y],i) => (
        <g key={i}><circle cx={x} cy={y} r="3.6" className="table" /><circle cx={x} cy={y} r="1.4" className="win" /></g>
      ))}
      <rect x="9" y="20" width="46" height="3" className="counter" />
      <rect x="0" y="38" width="64" height="4" className="road" />
    </svg>
  );
}

const cup = <><path d="M5 8 h11 v7 a5 5 0 0 1 -5 5 h-1 a5 5 0 0 1 -5 -5 z" className="fi-body" /><path d="M16 10 h2 a3 3 0 0 1 0 6 h-2" className="fi-line" /><path d="M8 4 q1 -2 0 -3 M11.5 4 q1 -2 0 -3" className="fi-line" /></>;
const glass = <><path d="M6 6 h12 l-2 14 h-8 z" className="fi-body" /><path d="M7 10 h10" className="fi-line" /></>;
const bun = <><path d="M4 14 a8 6 0 0 1 16 0 z" className="fi-body" /><path d="M4 14 h16 v3 h-16 z" className="fi-line" /></>;
const snack = <><path d="M12 4 L20 18 H4 Z" className="fi-body" /></>;
const sandwich = <><path d="M3 9 L12 4 L21 9 L12 14 Z" className="fi-body" /><path d="M3 13 L12 18 L21 13" className="fi-line" /></>;
const fries = <><path d="M7 20 h10 l-1 -9 h-8 z" className="fi-body" /><path d="M9 11 l1 -7 M12 11 v-8 M15 11 l-1 -7" className="fi-line" /></>;
const bowl = <><path d="M3 11 h18 a9 9 0 0 1 -18 0 z" className="fi-body" /><path d="M8 8 q4 -4 8 0" className="fi-line" /></>;
const cake = <><path d="M4 12 h16 v8 h-16 z" className="fi-body" /><path d="M12 12 v-5" className="fi-line" /><circle cx="12" cy="5" r="1.6" className="fi-body" /></>;

const ICONS: Record<string, ReactNode> = {
  "filter-coffee": cup, "instant-coffee": cup, "espresso": cup, "cappuccino": cup,
  "masala-chai": glass, "lemon-tea": glass, "cold-coffee": glass, "milkshake": glass,
  "bun-maska": bun, "butter-toast": bun,
  "samosa": snack, "vada-pav": snack,
  "veg-sandwich": sandwich, "grilled-sandwich": sandwich,
  "poha-upma": bowl, "rice-meal": bowl, "biryani": bowl, "paneer-main": bowl, "pasta": bowl,
  "fries": fries, "dessert": cake,
};

export function FoodIcon({ id }: { id: string }) {
  return <svg className="food-icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[id] ?? bowl}</svg>;
}

/* ---------- game screen art ---------- */

export function CafeScene({ format, busy, raining }: { format: string; busy: number; raining: boolean }) {
  // busy: 0..1 share of capacity being used -> how many figures appear
  const people = Math.min(7, Math.round(busy * 7));
  const seats = format === "takeaway" ? 0 : format === "full-cafe" ? 6 : 4;
  const spots: Array<[number, number]> = format === "full-cafe"
    ? [[34,54],[58,54],[82,54],[34,70],[58,70],[82,70]]
    : [[40,58],[70,58],[40,72],[70,72]];
  return (
    <svg className="scene" viewBox="0 0 160 96" role="img" aria-label={raining ? "Your cafe in the rain" : busy > .7 ? "Your cafe, busy" : busy > .3 ? "Your cafe, ticking along" : "Your cafe, quiet"}>
      <rect x="0" y="0" width="160" height="96" className="sky" />
      {!raining && <circle cx="136" cy="18" r="9" className="sun" />}
      <rect x="14" y="24" width="132" height="58" className="bld-main" rx="4" />
      <rect x="14" y="24" width="132" height="9" className="awning" />
      <rect x="14" y="78" width="132" height="4" className="counter" />
      {Array.from({ length: seats }).map((_, i) => {
        const [x, y] = spots[i] ?? [0, 0];
        return <circle key={i} cx={x} cy={y} r="6" className="table" />;
      })}
      {Array.from({ length: people }).map((_, i) => {
        const [x, y] = spots[i] ?? [26 + i * 18, 70];
        return <g key={i} className="person" style={{ animationDelay: `${i * 0.18}s` }}>
          <circle cx={x} cy={y - 7} r="2.6" className="person-head" />
          <path d={`M${x - 3.4} ${y + 1} q3.4 -5 6.8 0 z`} className="person-body" />
        </g>;
      })}
      {people === 0 && <text x="80" y="60" className="empty-note" textAnchor="middle">quiet today</text>}
      {raining && Array.from({ length: 16 }).map((_, i) => (
        <line key={i} className="rain" style={{ animationDelay: `${(i % 5) * 0.14}s` }}
          x1={6 + i * 10} y1="0" x2={2 + i * 10} y2="10" />
      ))}
      <rect x="0" y="82" width="160" height="14" className="road" />
    </svg>
  );
}

const D_ICONS: Record<string, ReactNode> = {
  marketing: <><path d="M4 10 L14 5 v14 L4 14 z" className="fi-body" /><path d="M14 8 a4 4 0 0 1 0 8" className="fi-line" /></>,
  quality: <path d="M12 3 l2.6 5.6 6 .8 -4.4 4.2 1.1 6.1 -5.3 -2.9 -5.3 2.9 1.1 -6.1 -4.4 -4.2 6 -.8 z" className="fi-body" />,
  inventory: <><path d="M4 8 h16 v12 h-16 z" className="fi-body" /><path d="M4 8 l3 -4 h10 l3 4" className="fi-line" /><path d="M12 8 v12" className="fi-line" /></>,
  "inventory-2": <><path d="M2 10 h9 v10 h-9 z" className="fi-body" /><path d="M13 10 h9 v10 h-9 z" className="fi-body" /><path d="M2 10 l2 -3 h5 l2 3 M13 10 l2 -3 h5 l2 3" className="fi-line" /></>,
  "inventory-3": <><path d="M1 12 h7 v8 h-7 z" className="fi-body" /><path d="M8.5 12 h7 v8 h-7 z" className="fi-body" /><path d="M16 12 h7 v8 h-7 z" className="fi-body" /><path d="M8.5 12 l1.5 -3 h4 l1.5 3" className="fi-line" /></>,
  hire: <><circle cx="9" cy="8" r="3.4" className="fi-body" /><path d="M3 20 q6 -7 12 0 z" className="fi-body" /><path d="M18 6 v7 M14.5 9.5 h7" className="fi-line" /></>,
  "raise-price": <><path d="M12 20 V5 M6 11 l6 -6 6 6" className="fi-line" /></>,
  "lower-price": <><path d="M12 4 v15 M6 13 l6 6 6 -6" className="fi-line" /></>,
  "no-action": <><circle cx="12" cy="12" r="8" className="fi-line" /><path d="M12 7 v5 l3.5 2" className="fi-line" /></>,
  "supply-contract": <><path d="M2 12 h10 v6 h-10 z" className="fi-body" /><path d="M12 14 h5 l4 3 v1 h-9 z" className="fi-body" /><circle cx="6" cy="19" r="2" className="fi-line" /><circle cx="16" cy="19" r="2" className="fi-line" /></>,
  "hire-manager": <><circle cx="12" cy="7" r="3.4" className="fi-body" /><path d="M5 20 q7 -8 14 0 z" className="fi-body" /><path d="M9 3.5 l3 -2 l3 2" className="fi-line" /></>,
  "extend-hours": <><circle cx="12" cy="12" r="8" className="fi-line" /><path d="M12 7 v5 l4 2" className="fi-line" /><path d="M19 4 l2 -2 M3 4 l-2 -2" className="fi-line" /></>,
  "loyalty-programme": <><path d="M12 20 s-7 -4.5 -7 -9 a4 4 0 0 1 7 -2.6 a4 4 0 0 1 7 2.6 c0 4.5 -7 9 -7 9 z" className="fi-body" /></>,
};
export function DecisionIcon({ id }: { id: string }) {
  return <svg className="dec-icon" viewBox="0 0 24 24" aria-hidden="true">{D_ICONS[id] ?? D_ICONS["no-action"]}</svg>;
}

export function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 100, h = 28, min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const up = values[values.length - 1] >= values[0];
  return <svg className={`spark ${up ? "up" : "down"}`} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><polyline points={pts} /></svg>;
}
