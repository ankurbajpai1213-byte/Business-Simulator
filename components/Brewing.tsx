"use client";

/** An espresso machine pulling a shot while the engine runs. */
export default function Brewing({ label }: { label: string }) {
  return (
    <div className="brewing" role="status" aria-live="polite">
      <svg viewBox="0 0 140 124" className="brew-art" aria-hidden="true">
        {/* machine body */}
        <rect x="18" y="10" width="104" height="46" rx="7" className="mach-body" />
        <rect x="18" y="10" width="104" height="12" rx="6" className="mach-top" />
        <circle cx="34" cy="34" r="5" className="mach-dial" />
        <circle cx="34" cy="34" r="1.8" className="mach-pin" />
        <rect x="48" y="29" width="56" height="11" rx="3" className="mach-panel" />
        <rect x="52" y="32" width="14" height="5" rx="2" className="mach-led" />

        {/* group head and portafilter */}
        <rect x="58" y="56" width="24" height="9" rx="3" className="mach-group" />
        <rect x="63" y="65" width="14" height="6" rx="2" className="mach-group" />
        <rect x="82" y="58" width="22" height="4" rx="2" className="mach-handle" />

        {/* twin streams */}
        <g className="shots">
          <line x1="66" y1="72" x2="66" y2="88" />
          <line x1="74" y1="72" x2="74" y2="88" />
        </g>

        {/* cup */}
        <path d="M52 88 h36 v18 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" className="cup-glass" />
        <clipPath id="espClip"><path d="M52 88 h36 v18 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" /></clipPath>
        <g clipPath="url(#espClip)">
          <rect x="52" y="80" width="36" height="40" className="cup-fill" />
          <rect x="52" y="80" width="36" height="5" className="cup-crema" />
        </g>
        <path d="M52 88 h36 v18 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" className="cup-outline" />
        <path d="M88 93 h6 a7 7 0 0 1 0 13 h-6" className="cup-outline" />

        {/* saucer */}
        <rect x="44" y="117" width="52" height="4" rx="2" className="mach-saucer" />

        {/* steam */}
        <g className="steam">
          <path d="M64 84 q4 -7 0 -13" /><path d="M76 84 q4 -7 0 -13" />
        </g>
      </svg>
      <div className="brew-label">{label}</div>
    </div>
  );
}
