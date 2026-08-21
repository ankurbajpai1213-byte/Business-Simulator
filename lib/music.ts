/* An original chiptune loop, generated in code. No files, no libraries.
   Bright major key, bouncy swing — the mood of an old console platformer. */

import { soundOn } from "./sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let step = 0;
let nextNoteTime = 0;
let running = false;

const BPM = 132;
const STEP = 60 / BPM / 2;           // eighth notes
const LOOKAHEAD = 0.12;

const N: Record<string, number> = {
  "-": 0,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94, C2: 65.41, G2: 98.0, F2: 87.31, A2: 110.0,
};

// 32 eighth-notes: four bars that lift and resolve.
const LEAD = [
  "G4","-","C5","-","E5","-","C5","-",
  "D5","-","G4","-","E5","D5","C5","-",
  "F4","-","A4","-","C5","-","A4","-",
  "G4","B4","D5","-","C5","-","-","-",
];
const BASS = [
  "C3","-","C3","-","G2","-","G2","-",
  "A2","-","A2","-","E3","-","E3","-",
  "F2","-","F2","-","C3","-","C3","-",
  "G2","-","G2","-","C3","-","G2","-",
];

function voice(freq: number, time: number, dur: number, type: OscillatorType, gain: number) {
  if (!ctx || !master || !freq) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(gain, time + 0.012);
  env.gain.setValueAtTime(gain, time + dur * 0.6);
  env.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(env); env.connect(master);
  osc.start(time); osc.stop(time + dur + 0.02);
}

function schedule() {
  if (!ctx || !running) return;
  while (nextNoteTime < ctx.currentTime + LOOKAHEAD) {
    const i = step % 32;
    voice(N[LEAD[i]] ?? 0, nextNoteTime, STEP * 1.5, "square", 0.16);
    if (i % 2 === 0) voice(N[BASS[i]] ?? 0, nextNoteTime, STEP * 1.7, "triangle", 0.22);
    nextNoteTime += STEP;
    step += 1;
  }
}

/** A tap arrived: unfreeze the audio context if the browser had it suspended. */
export function resumeMusic() {
  if (typeof window === "undefined" || !soundOn()) return;
  if (!running) { startMusic(); return; }
  if (ctx && ctx.state === "suspended") {
    void ctx.resume().then(() => {
      // Time moved on while we were frozen; restart scheduling from now.
      if (ctx && running) nextNoteTime = Math.max(nextNoteTime, ctx.currentTime + 0.05);
    });
  }
}

export function startMusic() {
  if (running || typeof window === "undefined" || !soundOn()) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    if (!master) { master = ctx.createGain(); master.gain.value = 0.055; master.connect(ctx.destination); }
    master.gain.value = 0.055;
    running = true;
    step = 0;
    nextNoteTime = ctx.currentTime + 0.08;
    timer = window.setInterval(schedule, 25);
  } catch { /* music is optional */ }
}

export function stopMusic() {
  running = false;
  if (timer !== null) { window.clearInterval(timer); timer = null; }
  if (master && ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
}

/** Drop the music back briefly so an effect or a moment can be heard cleanly. */
export function duck(ms = 500) {
  if (!master || !ctx || !running) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(0.012, now, 0.04);
  master.gain.setTargetAtTime(0.055, now + ms / 1000, 0.12);
}
