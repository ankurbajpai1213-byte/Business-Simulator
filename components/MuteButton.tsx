"use client";

import { useEffect, useState } from "react";
import { setSound, soundOn } from "@/lib/sound";
import { startMusic, stopMusic, resumeMusic } from "@/lib/music";

/** Always reachable, on every screen, from the very first one. */
export default function MuteButton() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(soundOn()); }, []);
  return (
    <button className="mute-float" aria-label={on ? "Turn sound off" : "Turn sound on"}
      onClick={() => {
        const next = !on;
        setSound(next);
        setOn(next);
        if (next) { startMusic(); resumeMusic(); } else stopMusic();
      }}>
      {on ? "🔊" : "🔇"}
    </button>
  );
}
