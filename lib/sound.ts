/* Tiny generated sounds. No files, no libraries. Off unless the player turns it on. */

let ctx: AudioContext | null = null;
const KEY = "bs-sound-on";

export function soundOn(): boolean {
  if (typeof window === "undefined") return false;
  // On by default; only silent if the player has explicitly turned it off.
  return localStorage.getItem(KEY) !== "0";
}
export function setSound(on: boolean) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, on ? "1" : "0");
}

function tone(freq: number, ms: number, type: OscillatorType, gain: number, delay = 0) {
  if (!soundOn()) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    vol.gain.setValueAtTime(0, start);
    vol.gain.linearRampToValueAtTime(gain, start + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.0001, start + ms / 1000);
    osc.connect(vol); vol.connect(ctx.destination);
    osc.start(start); osc.stop(start + ms / 1000 + 0.02);
  } catch { /* audio is a nicety, never a failure */ }
}

export const sfx = {
  tap: () => tone(520, 60, "sine", 0.05),
  select: () => tone(660, 80, "sine", 0.06),
  coin: () => { tone(880, 110, "triangle", 0.07); tone(1320, 130, "triangle", 0.05, 0.07); },
  loss: () => { tone(220, 200, "sine", 0.06); tone(165, 260, "sine", 0.05, 0.1); },
  milestone: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 220, "triangle", 0.07, i * 0.09)); },
};
