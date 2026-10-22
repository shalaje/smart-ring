/**
 * Scroll → scene. Every homepage section carries data-key; keyframes are tied to real section
 * boundaries and re-measured on every ScrollTrigger refresh. Each keyframe is a full set of
 * channels (light, colour, camera), so one scroll value drives the 3D, the night and the pill.
 *
 * Sticky sections (Heart, Sleep, Temperature, Readiness, Breathe) are taller than the screen;
 * `f` is progress through their held part (0 = section top reaches the top of the screen,
 * 1 = it is about to release). `lead` starts a key that many screen-heights earlier.
 */
export type Channels = {
  ring: number; // ring scale/visibility
  glow: number; // inner light band
  heart: number; // ripple strength
  sleep: number; // sleep waves
  night: number; // day → night, scrubbed: background, fog and page text all read it
  temp: number; // temperature glow
  warmth: number; // 0 cool → 1 warm
  merge: number; // the readiness sphere
  sz: number; // sphere radius as a share of screen height (measured from the layout's slot)
  point: number; // sphere folded back into the ring as a point of light
  app: number; // sphere travels into the phone mockup's screen
  cut: number; // cutaway
  spark: number; // footer: glow fades to a single soft point
  spin: number; // ring turn speed
  rx: number; // ring tilt
  ry: number;
  camZ: number;
  sx: number; // subject offset, fraction of the screen
  sy: number;
};
type Cam = Partial<Pick<Channels, "camZ" | "sx" | "sy" | "rx" | "ry">>;
/** `slot`: the sphere's place and size come from the section's [data-slot] element. */
type Def = { key: string; f?: number; lead?: number; v: Partial<Channels>; phone?: Cam; slot?: boolean };

const BASE: Channels = { ring: 1, glow: 0.7, heart: 0, sleep: 0, night: 0, temp: 0, warmth: 0.5, merge: 0, sz: 0.16, point: 0, app: 0, cut: 0, spark: 0, spin: 0.12, rx: -1.05, ry: 0.42, camZ: 4.6, sx: 0.2, sy: 0 };

// Phones: the whole ring sits inside the top 40% of the screen, below the nav.
const PH = { sx: 0, sy: 0.26 };

// Values carry forward: each def only lists what changes.
const DEFS: Def[] = [
  { key: "hero", f: 0, v: {}, phone: { ...PH, camZ: 11 } },
  { key: "heart", lead: 0.7, f: 0, v: { heart: 0.15, spin: 0, rx: -0.6, ry: 0.3 } },
  { key: "heart", f: 0, v: { heart: 1, glow: 0.9, rx: -0.32, ry: 0.18, camZ: 4.4 }, phone: { ...PH, camZ: 12.5 } },
  { key: "heart", f: 0.8, v: { heart: 1, rx: -0.28, ry: 0.14 } },
  // ripples end with Heart
  { key: "heart", f: 1, v: { heart: 0, rx: -0.2, ry: 0.08 } },
  // the dive has its own screen of scroll: the ring grows past every edge, then night falls
  { key: "sleep", lead: 0.96, f: 0, v: { rx: -0.12, ry: 0.04, sx: 0.14 }, phone: { ...PH, camZ: 12.5 } },
  { key: "sleep", lead: 0.55, f: 0, v: { rx: 0, ry: 0, camZ: 1.5, sx: 0, sleep: 0.3, glow: 1 }, phone: { sx: 0, sy: 0, camZ: 3 } },
  { key: "sleep", lead: 0.15, f: 0, v: { night: 1, sleep: 1, camZ: -0.9 }, phone: { sx: 0, sy: 0, camZ: -0.9 } },
  { key: "sleep", f: 0.72, v: { camZ: -3.0 }, phone: { sx: 0, sy: 0, camZ: -3.0 } },
  { key: "sleep", f: 0.8, v: {} },
  // out of the tunnel and back to dawn before any Temperature text reaches the screen
  { key: "sleep", f: 1, v: { night: 0, sleep: 0, temp: 0.2, warmth: 0, glow: 0.7, rx: -0.75, ry: -0.35, camZ: 4.5, sx: 0.2 }, phone: { ...PH, camZ: 11.5 } },
  { key: "temp", lead: 0.5, f: 0, v: { temp: 0.5 } },
  { key: "temp", f: 0.1, v: { temp: 1, warmth: 0 } },
  { key: "temp", f: 0.62, v: { temp: 1, warmth: 1, ry: -0.1 } },
  // Readiness merges over the end of Temperature
  { key: "temp", f: 1, v: { temp: 0.45, warmth: 0.8, merge: 0.55, ring: 0.35, glow: 0.4, sx: 0.08 }, phone: { sx: 0, sy: 0.2, camZ: 9.5 } },
  { key: "ready", f: 0, v: { temp: 0, merge: 1, ring: 0, glow: 0, camZ: 5.3 }, phone: { camZ: 8.8 }, slot: true },
  { key: "ready", f: 1, v: {}, slot: true },
  { key: "breathe", f: 0, v: {}, slot: true },
  { key: "breathe", f: 1, v: {}, slot: true },
  // the sphere is gone before the ring comes back for the finish picker
  { key: "ring", lead: 0.72, f: 0, v: { merge: 0, point: 0, ring: 0, glow: 0.6, rx: -1.0, ry: 0.5, spin: 1, sx: -0.2, sy: 0, camZ: 4.4 }, phone: { ...PH, camZ: 11.5 } },
  { key: "ring", lead: 0.3, f: 0, v: { ring: 1, point: 1 } },
  { key: "ring", f: 1, v: {} },
  // the point of light becomes the app
  { key: "app", lead: 0.75, f: 0, v: { ring: 0.0, glow: 0.2, point: 1, app: 0, spin: 0.6, sx: -0.05 } },
  { key: "app", lead: 0.15, f: 0, v: { point: 0, app: 1 } },
  { key: "app", f: 1, v: {} },
  { key: "privacy", lead: 0.35, f: 0, v: { ring: 1, cut: 1, glow: 0.5, rx: -1.0, ry: 0.62, spin: 0, sx: 0.22, sy: 0.02, camZ: 4.1 }, phone: { ...PH, camZ: 10.5 } },
  { key: "privacy", f: 1, v: {} },
  { key: "faq", lead: 0.4, f: 0, v: { cut: 0, ring: 0.42, rx: -1.05, ry: 0.4, spin: 0.5, sx: 0.36, sy: 0.34 }, phone: { sx: 0.25, sy: 0.38, camZ: 10.5 } },
  { key: "footer", lead: 0.6, f: 0, v: { ring: 1, glow: 0, spark: 1, spin: 0.04, rx: -1.12, ry: 0, sx: 0, sy: 0.14, camZ: 5.2 }, phone: { ...PH, camZ: 12 } },
  // phones: as the footer copy scrolls in, the resting ring drifts up and out of its way
  { key: "footer", f: 1, v: {}, phone: { sy: 0.62 } },
];

/** Where the section's sphere slot sits while the section is held: centre and radius as screen shares. */
function measureSlot(section: HTMLElement, vh: number) {
  const slot = section.querySelector<HTMLElement>("[data-slot]");
  const hold = section.querySelector<HTMLElement>(".hold");
  if (!slot || !hold) return null;
  const r = slot.getBoundingClientRect();
  const h = hold.getBoundingClientRect();
  if (!r.height) return null;
  const cx = (r.left + r.width / 2) / window.innerWidth;
  const cy = (r.top - h.top + r.height / 2) / vh;
  // leave room for the in-breath (+15%) and the surface noise
  const rad = Math.min(r.width, r.height) / 2 / 1.26 / vh;
  return { sx: cx - 0.5, sy: 0.5 - cy, sz: rad };
}

export type Key = { y: number; key: string; v: Channels; vp: Channels };
export const keys = { list: [] as Key[], max: 1, sections: [] as { key: string; top: number; held: number }[] };

/** Progress through a section: s in screens from its hold start, p as a share of the hold. */
export function progressOf(key: string, y: number) {
  const sec = keys.sections.find((x) => x.key === key);
  if (!sec) return { s: 1, p: 1 };
  const vh = window.innerHeight;
  const s = (y - sec.top) / vh;
  const p = sec.held > 0 ? (y - sec.top) / sec.held : s > 0 ? 1 : 0;
  return { s, p };
}

const topOf = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

export function measureKeys() {
  const vh = window.innerHeight;
  const list: Key[] = [];
  let cur = { ...BASE };
  let curP = { ...BASE };
  for (const d of DEFS) {
    const el = document.querySelector<HTMLElement>(`[data-key="${d.key}"]`);
    cur = { ...cur, ...d.v };
    curP = { ...curP, ...d.v, ...(d.phone ?? {}) };
    if (!el) continue;
    if (d.slot) {
      const m = measureSlot(el, vh);
      if (m) {
        cur = { ...cur, ...m };
        curP = { ...curP, ...m };
      }
    }
    const top = topOf(el);
    const held = Math.max(0, el.offsetHeight - vh);
    const y = d.key === "hero" ? 0 : top + (d.f ?? 0) * held - (d.lead ?? 0) * vh;
    list.push({ y: Math.max(0, y), key: d.key, v: { ...cur }, vp: { ...curP } });
  }
  list.sort((a, b) => a.y - b.y);
  keys.list = list;
  keys.sections = [...document.querySelectorAll<HTMLElement>("[data-key]")].map((el) => ({ key: el.dataset.key!, top: topOf(el), held: Math.max(0, el.offsetHeight - vh) }));
  keys.max = Math.max(1, document.documentElement.scrollHeight - vh);
}

const sm = (t: number) => t * t * (3 - 2 * t);
const out = {} as Channels;

/** Channels at a scroll position: smooth-stepped between the two keys around it. */
export function channelsAt(y: number, phone: boolean): Channels {
  const k = keys.list;
  const pick = (x: Key) => (phone ? x.vp : x.v);
  if (!k.length) return Object.assign(out, BASE);
  if (y <= k[0].y) return Object.assign(out, pick(k[0]));
  for (let i = 0; i < k.length - 1; i++) {
    if (y <= k[i + 1].y) {
      const a = pick(k[i]),
        b = pick(k[i + 1]);
      const span = k[i + 1].y - k[i].y;
      const t = span <= 0 ? 1 : sm((y - k[i].y) / span);
      for (const c in a) (out as Record<string, number>)[c] = (a as Record<string, number>)[c] + ((b as Record<string, number>)[c] - (a as Record<string, number>)[c]) * t;
      return out;
    }
  }
  return Object.assign(out, pick(k[k.length - 1]));
}

/** The section the scroll position sits in (used by the pill, the night and the stills). */
export function sectionAt(y: number) {
  const vh = window.innerHeight;
  let cur = "hero";
  for (const s of keys.sections) if (s.top - vh * 0.5 <= y) cur = s.key;
  return cur;
}

/** Scroll target that lands a sticky section in its held part (where its scene is at full strength). */
export function sectionY(key: string) {
  const s = keys.sections.find((x) => x.key === key);
  if (!s) return null;
  return s.top + s.held * (key === "sleep" ? 0.3 : 0.2);
}
