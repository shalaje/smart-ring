import { scene } from "~/lib/sceneState";

const IN = 4;
const OUT = 6;
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

let last = 0;
let holdStart = 0;

/**
 * The body-speed clock, stepped once per tick from the GSAP ticker (it runs with or without
 * the canvas). Two clocks live here on purpose:
 *  - `scene.clock` is scene time: heartbeat, waves, glow and noise. Holding Breathe eases its
 *    speed to a third; letting go eases it back over ~600 ms.
 *  - the breath cycle runs on real time (performance.now), never on scene time, so it is
 *    exactly 4 s in and 6 s out however slow the scene is.
 */
export function stepClock(still = false) {
  const now = performance.now() / 1000;
  const dt = last ? Math.min(now - last, 0.25) : 1 / 60;
  last = now;
  if (still) return;

  const k = 1 - Math.exp(-dt * 6); // ~600 ms to settle
  scene.timeScale += ((scene.holding ? 1 / 3 : 1) - scene.timeScale) * k;
  scene.clock += dt * scene.timeScale;

  let target: number;
  if (scene.holding) {
    if (!holdStart) holdStart = now;
    scene.holdFor = now - holdStart;
    const p = scene.holdFor % (IN + OUT);
    scene.breathIn = p < IN;
    scene.breathPhase = p < IN ? p / IN : (p - IN) / OUT;
    target = p < IN ? ease(p / IN) : 1 - ease((p - IN) / OUT);
    // follow the cycle tightly once it is running; the first moment eases in from rest
    scene.breath += (target - scene.breath) * (scene.holdFor < 0.6 ? k : 1 - Math.exp(-dt * 14));
  } else {
    holdStart = 0;
    scene.holdFor = 0;
    scene.breathIn = true;
    scene.breathPhase = 0;
    // at rest the sphere still breathes, shallowly, at resting pace (on real time too)
    target = 0.2 + 0.15 * Math.sin((now / (IN + OUT)) * Math.PI * 2);
    scene.breath += (target - scene.breath) * k;
  }

  // ~60 bpm on scene time: a soft "lub-dub" envelope
  const ph = scene.clock % 1;
  scene.beat = Math.exp(-ph * 7) + 0.42 * Math.exp(-Math.pow((ph - 0.24) * 13, 2));
}

/** seconds left in the current breath phase, for the button label: IN 4 → 1, OUT 6 → 1 */
export function breathCountdown() {
  const p = scene.holdFor % (IN + OUT);
  return Math.max(1, Math.ceil(p < IN ? IN - p : IN + OUT - p));
}
export const BREATH = { IN, OUT };
