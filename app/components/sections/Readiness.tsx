import { SceneSection } from "./Scene";
import { Reveal } from "../ui/Reveal";
import { Counter } from "../ui/Counter";
import { Concept } from "../ui/Signal";

const PARTS = [
  { name: "Resting heart", value: "Below usual", color: "var(--pulse)" },
  { name: "Sleep", value: "7 h 42 · steady", color: "var(--sleep)" },
  { name: "Temperature", value: "+0.3 °C · watch", color: "var(--warm)" },
];

export function Readiness() {
  return (
    <SceneSection id="ready" label="Readiness" height="lg:h-[190svh] h-[170svh]" align="center">
      <div className="site flex min-h-[100svh] flex-col justify-between pb-24 pt-24 lg:pb-16 lg:pt-28">
        <Reveal className="text-center">
          <p className="text-label text-muted"><span className="tnum" style={{ color: "#4F8C78" }}>04</span>&nbsp;&nbsp;&nbsp;Readiness</p>
          <p className="mt-4 flex flex-col items-center" aria-label="Readiness score 84, Ready (concept)">
            <Counter to={84} duration={1800} className="text-score" />
            <span className="mt-2 font-serif text-[30px] italic leading-none text-[#4F8C78] lg:text-[36px]">Ready</span>
          </p>
        </Reveal>
        <Reveal className="grid grid-cols-12 items-end gap-y-5 lg:gap-y-8">
          <div className="col-span-12 lg:col-span-4">
            <h2 id="ready-title" className="text-h2 max-w-[12ch]">One number for the morning.</h2>
            <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-muted max-lg:hidden">
              Heart, sleep and temperature, each weighed against your own normal, become one score. 80 and up: ready. 65 to 79: steady. Below 65: rest.
            </p>
          </div>
          <ul className="col-span-12 space-y-2.5 lg:col-span-4 lg:col-start-9">
            {PARTS.map((p) => (
              <li key={p.name} className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
                <span className="flex items-baseline gap-3">
                  <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
                  <span className="text-label text-muted">{p.name}</span>
                </span>
                <span className="tnum font-mono text-[14px]">{p.value}</span>
              </li>
            ))}
            <li><Concept>Concept score, not a clinical result</Concept></li>
          </ul>
        </Reveal>
      </div>
    </SceneSection>
  );
}
