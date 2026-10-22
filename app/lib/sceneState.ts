export type Finish = "bone" | "titanium" | "black";

/** One bridge between the page and the ring. GSAP and the page write; the 3D reads every frame. */
export const scene = {
  scrollY: 0,
  velocity: 0,
  px: 0,
  py: 0,
  tilt: true,
  phone: false,
  still: false,
  shot: "" as string,
  time: 0,
  loader: 0, // 0–1: the ring's inner light fills around the band while the scene loads
  fill: 0, // fade-in after load

  /** body-speed clock: advances by real time × timeScale (Breathe slows it to a third) */
  clock: 0,
  timeScale: 1,
  holding: false,
  holdFor: 0, // seconds the visitor has held the breathe button
  breath: 0, // 0 empty → 1 full lungs
  breathIn: true,
  beat: 0, // 0–1 heartbeat envelope at ~60 bpm

  night: 0, // single day→night value shared by background, fog and text
  finish: "bone" as Finish,
};

type FinishListener = (f: Finish) => void;
let finishListeners: FinishListener[] = [];
export function setFinish(f: Finish) {
  scene.finish = f;
  finishListeners.forEach((l) => l(f));
}
export function onFinish(l: FinishListener) {
  finishListeners.push(l);
  return () => void (finishListeners = finishListeners.filter((x) => x !== l));
}

/** HTML elements the canvas reads from or positions every frame. */
export const overlay = {
  phoneScreen: null as HTMLElement | null, // the sphere flies into this element's window
  sensorLabels: [] as (HTMLElement | null)[],
  beatDots: new Set<HTMLElement>(),
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
