import { SceneSection } from "./Scene";
import { Eyebrow, Reveal } from "../ui/Reveal";
import { Concept, Signal } from "../ui/Signal";

// two weeks of nightly skin temperature against your baseline, °C (concept)
const NIGHTS = [-0.12, -0.04, 0.02, -0.08, 0.05, -0.02, 0.04, 0.0, 0.08, 0.12, 0.2, 0.26, 0.31, 0.3];

function Trend() {
  const W = 320,
    H = 96,
    max = 0.4;
  const y = (v: number) => H / 2 - (v / max) * (H / 2 - 8);
  const pts = NIGHTS.map((v, i) => [10 + (i * (W - 20)) / (NIGHTS.length - 1), y(v)] as const);
  const d = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`).join(" ");
  return (
    <figure className="mt-8 rounded-card border border-line bg-card/70 p-5 backdrop-blur-sm" aria-label="Skin temperature, last 14 nights: close to baseline, then rising to 0.3 °C above it over the last four nights (concept data).">
      <div className="flex items-baseline justify-between">
        <span className="text-label text-muted">Last 14 nights</span>
        <span className="text-label text-muted">vs. your baseline</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-24 w-full" aria-hidden>
        <defs>
          <linearGradient id="tline" x1="0" x2="1">
            <stop offset="0" stopColor="#8FAFD8" />
            <stop offset="0.6" stopColor="#B9A88E" />
            <stop offset="1" stopColor="#E3A257" />
          </linearGradient>
        </defs>
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 4" />
        <path d={d} fill="none" stroke="url(#tline)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, yy], i) => (
          <circle key={i} cx={x} cy={yy} r={i === pts.length - 1 ? 4 : 2} fill={i > 9 ? "#E3A257" : "#8FAFD8"} />
        ))}
      </svg>
      <figcaption className="mt-2 text-[14px] text-muted">Four warm nights in a row. Sela would suggest an easier day, nothing more.</figcaption>
    </figure>
  );
}

export function Temperature() {
  return (
    <SceneSection id="temp" label="Temperature" height="lg:h-[240svh] h-[210svh]" fade="-0.6,-0.25|0.82,0.97" afterNight>
      <div className="site grid grid-cols-12 phone-gap">
        <Reveal className="col-span-12 lg:col-span-5">
          <Eyebrow n="03" color="#B8752F">Temperature</Eyebrow>
          <h2 id="temp-title" className="text-h2 mt-5 max-w-[13ch]">Small shifts, noticed early.</h2>
          <p className="text-body mt-6 measure text-muted max-lg:hidden">
            Your skin temperature drifts a little every night. Sela learns your normal and tells you when you run warmer or cooler than usual, often a hint to take it easy.
          </p>
          <Signal className="mt-7" name="Skin temp" value="+0.3 °C vs. baseline" color="var(--warm)" />
          <Trend />
          <Concept className="mt-3" />
        </Reveal>
      </div>
    </SceneSection>
  );
}
