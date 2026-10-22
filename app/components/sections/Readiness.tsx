import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SceneSection } from "./Scene";
import { Concept } from "../ui/Signal";
import { CssSphere } from "../ui/CssSphere";
import { useTier } from "~/lib/experience";
import { progressOf } from "~/lib/keys";
import { scene } from "~/lib/sceneState";

const PARTS = [
  { name: "Resting heart", value: "Below usual", color: "var(--pulse)" },
  { name: "Sleep", value: "7 h 42 · steady", color: "var(--sleep)" },
  { name: "Temperature", value: "+0.3 °C · watch", color: "var(--warm)" },
];
const SCORE = 84;
const stateOf = (v: number) => (v >= 80 ? "Ready" : v >= 65 ? "Steady" : "Rest");

/**
 * The score counts 0 → 84 over 1.2 s once Readiness is held on screen (never while another
 * section is visible), and resets when you scroll back above it, so it plays again.
 * The state word appears when the count lands, always matching the number's band.
 */
function Score() {
  const [v, setV] = useState(SCORE);
  const [done, setDone] = useState(true);
  const tier = useTier();
  useEffect(() => {
    if (tier === "pending" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const o = { v: 0 };
    let state: "idle" | "run" = "idle";
    setV(0);
    setDone(false);
    let tw: gsap.core.Tween | null = null;
    const tick = () => {
      const { s } = progressOf("ready", scene.scrollY);
      if (state === "idle" && s > -0.06 && s < 1.2) {
        state = "run";
        tw = gsap.to(o, { v: SCORE, duration: 1.2, ease: "power3.out", onUpdate: () => setV(Math.round(o.v)), onComplete: () => setDone(true) });
      } else if (state === "run" && s < -0.6) {
        state = "idle";
        tw?.kill();
        o.v = 0;
        setV(0);
        setDone(false);
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      tw?.kill();
    };
  }, [tier]);
  return (
    <p className="mt-3 flex flex-col items-center lg:mt-4" aria-label={`Readiness score ${SCORE}, ${stateOf(SCORE)} (concept)`}>
      <span className="tnum text-score" aria-hidden>
        {v}
      </span>
      <span aria-hidden className={`mt-1 font-serif text-[28px] italic leading-none text-[#4F8C78] transition-opacity duration-[400ms] lg:mt-2 lg:text-[36px] ${done ? "opacity-100" : "opacity-0"}`}>
        {stateOf(v)}
      </span>
    </p>
  );
}

export function Readiness() {
  const tier = useTier();
  const live = tier === "full" || tier === "mobile";
  return (
    <SceneSection id="ready" label="Readiness" height="lg:h-[190svh] h-[170svh]" align="center" fade="-0.06,0.02|0.78,0.96">
      <div className="site flex h-[calc(100svh-84px-env(safe-area-inset-bottom))] flex-col pt-20 lg:h-[calc(100svh-92px)] lg:pt-24">
        <div className="text-center">
          <p className="text-label text-muted">
            <span className="tnum" style={{ color: "#4F8C78" }}>04</span>&nbsp;&nbsp;&nbsp;Readiness
          </p>
          <Score />
        </div>
        {/* the sphere's place: the 3D reads this box's centre and size */}
        <div data-slot className="my-4 flex min-h-0 flex-1 items-center justify-center">{!live && tier !== "pending" && <CssSphere />}</div>
        <div className="grid grid-cols-12 items-end gap-y-4 lg:gap-y-8">
          <div className="col-span-12 lg:col-span-4">
            <h2 id="ready-title" className="text-h2 max-w-[12ch] max-lg:text-[30px]">One number for the morning.</h2>
            <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-muted max-lg:hidden">
              Heart, sleep and temperature, each weighed against your own normal, become one score. 80 and up: ready. 65 to 79: steady. Below 65: rest.
            </p>
          </div>
          <ul className="col-span-12 space-y-2 lg:col-span-4 lg:col-start-9 lg:space-y-2.5">
            {PARTS.map((p) => (
              <li key={p.name} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 lg:pb-2.5">
                <span className="flex items-baseline gap-3">
                  <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
                  <span className="text-label text-muted">{p.name}</span>
                </span>
                <span className="tnum font-mono text-[14px]">{p.value}</span>
              </li>
            ))}
            <li>
              <Concept>Concept score, not a clinical result</Concept>
            </li>
          </ul>
        </div>
      </div>
    </SceneSection>
  );
}
