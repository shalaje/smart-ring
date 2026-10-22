import { scene } from "~/lib/sceneState";

const IN = 4;
const OUT = 6;
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/**
 * The body-speed clock, stepped once per frame from the GSAP ticker's delta.
 * Holding Breathe eases timeScale to a third (every loop on the page slows) and drives
 * `breath` on a 4 s in / 6 s out cycle; letting go eases both back.
 */
export function stepClock(dt: number) {
  dt = Math.min(dt, 0.1);
  const k = 1 - Math.exp(-dt * 2.2);
  scene.timeScale += ((scene.holding ? 1 / 3 : 1) - scene.timeScale) * k;
  scene.clock += dt * scene.timeScale;

  let target: number;
  if (scene.holding) {
    scene.holdFor += dt;
    const p = scene.holdFor % (IN + OUT);
    scene.breathIn = p < IN;
    target = p < IN ? ease(p / IN) : 1 - ease((p - IN) / OUT);
  } else {
    scene.holdFor = 0;
    scene.breathIn = true;
    // at rest the sphere still breathes, shallowly, at resting pace
    target = 0.25 + 0.2 * Math.sin((scene.clock / (IN + OUT)) * Math.PI * 2);
  }
  scene.breath += (target - scene.breath) * (scene.holding ? 1 - Math.exp(-dt * 6) : k);

  // ~60 bpm: a soft "lub-dub" envelope
  const ph = scene.clock % 1;
  scene.beat = Math.exp(-ph * 7) + 0.42 * Math.exp(-Math.pow((ph - 0.24) * 13, 2));
  return ph;
}

/** seconds left in the current breath, for the button label */
export function breathCountdown() {
  const p = scene.holdFor % (IN + OUT);
  return Math.max(1, Math.ceil(p < IN ? IN - p : IN + OUT - p));
}
export const BREATH = { IN, OUT };
