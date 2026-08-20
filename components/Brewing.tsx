"use client";

/** Coffee pouring from a kettle into a glass cup while the engine runs. */
export default function Brewing({ label }: { label: string }) {
  return (
    <div className="brewing" role="status" aria-live="polite">
      <svg viewBox="0 0 140 120" className="brew-art" aria-hidden="true">
        {/* kettle */}
        <g className="kettle">
          <path d="M28 26 h44 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-44 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 z" className="brew-metal" />
          <path d="M78 34 q16 4 14 16 q-1 6 -8 8" className="brew-spout" />
          <path d="M22 32 q-12 6 -2 18" className="brew-handle" />
          <rect x="40" y="19" width="20" height="8" rx="3" className="brew-metal" />
        </g>
        {/* pour */}
        <path d="M88 58 q3 14 -2 26" className="pour" />
        {/* cup */}
        <path d="M50 78 h36 v22 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" className="cup-glass" />
        <clipPath id="cupClip"><path d="M50 78 h36 v22 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" /></clipPath>
        <g clipPath="url(#cupClip)"><rect x="50" y="70" width="36" height="42" className="cup-fill" /></g>
        <path d="M50 78 h36 v22 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" className="cup-outline" />
        <path d="M86 84 h6 a7 7 0 0 1 0 14 h-6" className="cup-outline" />
        {/* steam */}
        <g className="steam">
          <path d="M62 72 q4 -7 0 -13" /><path d="M70 72 q4 -7 0 -13" />
        </g>
      </svg>
      <div className="brew-label">{label}</div>
    </div>
  );
}
