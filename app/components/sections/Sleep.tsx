import { SceneSection } from "./Scene";
import { Eyebrow, Reveal } from "../ui/Reveal";
import { Concept } from "../ui/Signal";

const STAGES = [
  { name: "Awake", min: 31, color: "#DCDDFB" },
  { name: "REM", min: 108, color: "#B0B3F3" },
  { name: "Light", min: 232, color: "#8E93E6" },
  { name: "Deep", min: 91, color: "#6B70D1" },
];
const total = STAGES.reduce((a, s) => a + s.min, 0); // 462 min = 7 h 42
const fmt = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;

/** The night, as a clock ring: one arc per stage, the total inside. */
function ClockRing() {
  const R = 74;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <figure className="relative mx-auto size-[150px] shrink-0 lg:mx-0 lg:size-[188px]" aria-label={`7 hours 42 minutes of sleep (concept): ${STAGES.map((s) => `${s.name} ${fmt(s.min)}`).join(", ")}`}>
      <svg viewBox="0 0 188 188" className="size-full -rotate-90" aria-hidden>
        <circle cx="94" cy="94" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="8" />
        {STAGES.map((s) => {
          const len = (s.min / total) * C;
          const el = <circle key={s.name} cx="94" cy="94" r={R} fill="none" stroke={s.color} strokeWidth="8" strokeDasharray={`${Math.max(0, len - 4)} ${C}`} strokeDashoffset={-acc} strokeLinecap="round" />;
          acc += len;
          return el;
        })}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="94" y1="8" x2="94" y2="13" stroke="currentColor" strokeOpacity="0.35" transform={`rotate(${i * 30} 94 94)`} />
        ))}
      </svg>
      <figcaption className="absolute inset-0 grid place-content-center text-center">
        <span className="tnum font-mono text-[24px] font-light leading-none tracking-[-0.03em] lg:text-[30px]">7 h 42</span>
        <span className="text-label mt-2 !text-[10.5px] text-muted">asleep · concept</span>
      </figcaption>
    </figure>
  );
}

export function Sleep() {
  return (
    <SceneSection id="sleep" label="Sleep" height="lg:h-[300svh] h-[280svh]" fade="-0.12,0.03|0.64,0.76">
      {/* a soft scrim so the copy stays readable while the waves rush past */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--bg)_0%,color-mix(in_oklab,var(--bg)_80%,transparent)_45%,transparent_62%)] lg:bg-[linear-gradient(to_right,var(--bg)_0%,color-mix(in_oklab,var(--bg)_78%,transparent)_30%,transparent_52%)]" aria-hidden />
      <div className="site relative grid grid-cols-12 phone-gap">
        <Reveal className="col-span-12 lg:col-span-5">
          <Eyebrow n="02" color="var(--sleep)">Sleep</Eyebrow>
          <h2 id="sleep-title" className="text-h2 mt-5 max-w-[13ch]">Your night, in four layers.</h2>
          <p className="text-body mt-6 measure text-muted max-lg:hidden">
            Awake, REM, light and deep. Sela maps each stage from your heart and movement, so you can see what a good night looks like for you.
          </p>
          <div className="mt-6 flex items-center gap-5 lg:mt-8 lg:gap-6">
            <ClockRing />
            <ul className="grid w-full grid-cols-1 gap-y-2.5 lg:gap-y-3">
              {STAGES.map((s) => (
                <li key={s.name} className="flex items-baseline gap-3">
                  <span className="size-2 rounded-full" style={{ background: s.color }} aria-hidden />
                  <span className="text-label w-12 text-muted">{s.name}</span>
                  <span className="tnum font-mono text-[15px]">{fmt(s.min)}</span>
                </li>
              ))}
            </ul>
          </div>
          <Concept className="mt-5" />
        </Reveal>
      </div>
    </SceneSection>
  );
}
