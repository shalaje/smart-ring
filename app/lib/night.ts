/**
 * Day ↔ night colours, mixed in OKLab in one place. The canvas background, the fog and the
 * page's CSS variables all come from here, so HTML and 3D can never disagree mid-fade, and the
 * fade stays warm instead of passing through a flat grey.
 */
type RGB = [number, number, number];

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function toLab([r, g, b]: RGB): RGB {
  const R = toLin(r), G = toLin(g), B = toLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromLab([L, a, b]: RGB): RGB {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  const c = (v: number) => Math.min(1, Math.max(0, toSrgb(v)));
  return [c(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), c(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), c(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)];
}

const PAIRS = {
  bg: ["#F4EFE9", "#12131F"],
  fg: ["#1D1B20", "#F4EFE9"],
  "fg-muted": ["#5F5A63", "#AAA8B8"],
  card: ["#FBF9F6", "#1B1C2C"],
  rule: ["#E2DBD2", "#2B2D42"],
} as const;
const LABS = Object.fromEntries(Object.entries(PAIRS).map(([k, [a, b]]) => [k, [toLab(hex(a)), toLab(hex(b))]])) as Record<keyof typeof PAIRS, [RGB, RGB]>;

const DUSK = toLab(hex("#C7A193"));

export function mixLab(a: RGB, b: RGB, t: number): RGB {
  return fromLab([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}

const css = ([r, g, b]: RGB) => `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

/** sRGB (0–1) background for the canvas at night value n */
export const nightBg: RGB = [...hex(PAIRS.bg[0])] as RGB;

export function paintNight(n: number, root: HTMLElement) {
  for (const k of Object.keys(PAIRS) as (keyof typeof PAIRS)[]) {
    // the background passes through a warm first-light rose, never a flat grey
    const c = k === "bg" ? (n < 0.4 ? mixLab(LABS.bg[0], DUSK, n / 0.4) : mixLab(DUSK, LABS.bg[1], (n - 0.4) / 0.6)) : mixLab(LABS[k][0], LABS[k][1], n);
    if (k === "bg") (nightBg[0] = c[0]), (nightBg[1] = c[1]), (nightBg[2] = c[2]);
    root.style.setProperty(`--${k}`, css(c));
  }
}
