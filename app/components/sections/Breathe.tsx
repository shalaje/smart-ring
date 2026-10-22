import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SceneSection } from "./Scene";
import { CssSphere } from "../ui/CssSphere";
import { useTier } from "~/lib/experience";
import { scene } from "~/lib/sceneState";
import { breathCountdown } from "~/three/clock";

const R = 52;
const CIRC = 2 * Math.PI * R;

/** Hold to breathe: slows every loop on the page to a third; the ring line follows the breath. */
function HoldButton() {
  const [holding, setHolding] = useState(false);
  const [label, setLabel] = useState("Hold");
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let last = "";
    const tick = () => {
      // the ring fills over each phase: 4 s in, then 6 s out
      if (ring.current) {
        ring.current.style.strokeDashoffset = String(CIRC * (1 - (scene.holding ? scene.breathPhase : 0)));
        ring.current.style.stroke = scene.breathIn ? "var(--calm)" : "var(--sleep)";
      }
      const l = scene.holding ? `${scene.breathIn ? "In" : "Out"} · ${breathCountdown()}` : "Hold";
      if (l !== last) setLabel((last = l));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      scene.holding = false;
    };
  }, []);

  const set = (v: boolean) => {
    scene.holding = v;
    setHolding(v);
  };
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        aria-pressed={holding}
        aria-describedby="breathe-hint"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          set(true);
        }}
        onPointerUp={() => set(false)}
        onPointerCancel={() => set(false)}
        onLostPointerCapture={() => set(false)}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            set(true);
          }
        }}
        onKeyUp={(e) => (e.key === " " || e.key === "Enter") && set(false)}
        onBlur={() => set(false)}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative grid size-[108px] touch-none lg:size-[124px] select-none place-items-center rounded-full border border-line bg-card/80 backdrop-blur-sm transition-transform duration-[400ms] ease-[var(--ease)] [-webkit-touch-callout:none] ${holding ? "scale-[1.04]" : "hover:scale-[1.02]"}`}
      >
        <svg viewBox="0 0 124 124" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="62" cy="62" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3" />
          <circle ref={ring} cx="62" cy="62" r={R} fill="none" stroke="var(--calm)" strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC} />
        </svg>
        <span className="tnum font-mono text-[14px] uppercase tracking-[0.05em]" aria-live="polite">
          {label}
        </span>
        <span className="sr-only">Hold to breathe</span>
      </button>
      <p id="breathe-hint" className="text-label mt-4 text-muted">
        {holding ? "Everything slows to a third" : "Press and hold · in 4 s, out 6 s"}
      </p>
    </div>
  );
}

/** Reduced motion: a still guide instead of a loop. */
function StaticGuide() {
  return (
    <figure className="flex items-center gap-5 rounded-card border border-line bg-card/80 px-6 py-5" aria-label="Breathing guide: in for 4 seconds, out for 6 seconds, repeat for a minute.">
      <svg viewBox="0 0 80 80" className="size-16" aria-hidden>
        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--calm)" strokeWidth="3" strokeDasharray={`${(4 / 10) * 213.6} 213.6`} transform="rotate(-90 40 40)" />
      </svg>
      <figcaption className="font-mono text-[14px] uppercase leading-relaxed tracking-[0.05em]">
        In · 4 s
        <br />
        Out · 6 s
        <br />
        <span className="text-muted">Six rounds, one minute</span>
      </figcaption>
    </figure>
  );
}

export function Breathe() {
  const tier = useTier();
  const reduced = tier === "still";
  return (
    <SceneSection id="breathe" label="Breathe with me" height="lg:h-[200svh] h-[200svh]" align="center" fade="-0.06,0.03|0.86,1">
      <div className="site flex h-[calc(100svh-84px-env(safe-area-inset-bottom))] flex-col pt-20 lg:h-[calc(100svh-92px)] lg:pt-24">
        <div className="mx-auto max-w-[34ch] text-center">
          <p className="text-label text-muted">
            <span className="tnum" style={{ color: "#4F8C78" }}>05</span>&nbsp;&nbsp;&nbsp;Breathe with me
          </p>
          <h2 id="breathe-title" className="text-h2 mt-3 lg:mt-4">Slow down with it.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted lg:mt-4 lg:text-[16px]">
            Hold the button and breathe with the sphere: in for four, out for six. The whole page slows down with you.
          </p>
        </div>
        {/* the sphere's place: at least 32 px clear of the copy above and the button below */}
        <div data-slot className="my-8 flex min-h-0 flex-1 items-center justify-center">
          {tier !== "pending" && tier !== "full" && tier !== "mobile" && <CssSphere breathing={!reduced} />}
        </div>
        <div className="flex justify-center">{reduced ? <StaticGuide /> : <HoldButton />}</div>
      </div>
    </SceneSection>
  );
}
