import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useDemote, useTier } from "~/lib/experience";
import { scene } from "~/lib/sceneState";
import { sectionAt } from "~/lib/keys";

const Stage = lazy(() => import("~/three/Stage"));

/**
 * Still frame per section for reduced motion, no WebGL, or a device that can't hold the frame
 * rate. Readiness and Breathe have no still: their sphere is drawn in the layout itself.
 * Sleep is not chosen by section: its frame's opacity is the scrubbed night value.
 */
const STILL: Record<string, string | null> = {
  hero: "hero", heart: "heart", sleep: null, temp: "temp", ready: null, breathe: null,
  ring: "ring", app: null, privacy: "privacy", faq: null, footer: "footer",
};
const FRAMES = ["hero", "heart", "temp", "ring", "privacy", "footer"];

/**
 * The single persistent canvas behind the page: every section is transparent and the ring is
 * always there. The loader is the ring's own inner light filling 0 → 100%; until the first
 * frame is drawn the hero still sits in the same spot, so the ring never pops in.
 */
export function SceneLayer() {
  const tier = useTier();
  const demote = useDemote();
  const live = tier === "full" || tier === "mobile";
  const [mountStage, setMountStage] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [pct, setPct] = useState(0);
  const [still, setStill] = useState<string | null>("hero");
  const [scrolled, setScrolled] = useState(false);
  const [forced, setForced] = useState(false);
  const [phone, setPhone] = useState(false);
  const counter = useRef({ v: 0 });
  const night = useRef<HTMLImageElement>(null);

  // decided after hydration so the pre-rendered poster markup matches
  useEffect(() => {
    setForced(new URLSearchParams(location.search).has("tier"));
    setPhone(tier === "mobile" || innerWidth < 1024);
  }, [tier]);

  useEffect(() => {
    if (!live) return;
    scene.fill = 0;
    const up = () => (setPct(Math.round(counter.current.v)), (scene.loader = counter.current.v / 100));
    const tw = gsap.to(counter.current, { v: 70, duration: 2.2, ease: "power2.out", onUpdate: up });
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const go = () => setMountStage(true);
    const id = ric ? ric(go, { timeout: 900 }) : window.setTimeout(go, 250);
    return () => {
      tw.kill();
      if (!ric) clearTimeout(id);
    };
  }, [live]);

  useEffect(() => {
    if (!ready) return;
    const up = () => (setPct(Math.round(counter.current.v)), (scene.loader = counter.current.v / 100));
    gsap.to(counter.current, { v: 100, duration: 0.7, ease: "power1.out", overwrite: true, onUpdate: up });
    if (new URLSearchParams(location.search).get("shot")) {
      scene.fill = 1;
      return;
    }
    gsap.to(scene, { fill: 1, duration: 1.2, delay: 0.7, ease: "power2.inOut" });
  }, [ready]);

  // pause the render loop when the tab is hidden
  useEffect(() => {
    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    const onScroll = () => setScrolled(window.scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("scroll", onScroll);
    };
  }, []);

  // still frames: follow the section in view; the night frame follows the night value
  useEffect(() => {
    if (live || tier === "pending") return;
    let last = "";
    const tick = () => {
      const k = STILL[sectionAt(scene.scrollY)] ?? "";
      if (k !== last) setStill((last = k) || null);
      if (night.current) night.current.style.opacity = scene.night.toFixed(3);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [live, tier]);

  const done = pct >= 100;
  const suffix = phone ? "m" : "d";
  return (
    <div id="stage" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100svh] bg-[var(--bg)]" aria-hidden>
      {!live &&
        FRAMES.map((k) => (
          <img
            key={k}
            src={`/posters/${k}-${suffix}.webp`}
            alt=""
            loading={k === "hero" ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-x-0 top-0 h-[100svh] w-full object-cover object-top transition-opacity duration-[700ms] ease-[var(--ease)]"
            style={{ opacity: still === k ? 1 : 0 }}
          />
        ))}
      {!live && <img ref={night} src={`/posters/sleep-${suffix}.webp`} alt="" loading="lazy" decoding="async" className="absolute inset-x-0 top-0 h-[100svh] w-full object-cover object-top" style={{ opacity: 0 }} />}
      {/* live: the hero still holds the ring's place until the first frame is drawn */}
      {live && (
        <img
          src={`/posters/hero-${suffix}.webp`}
          alt=""
          decoding="async"
          className="absolute inset-x-0 top-0 z-[1] h-[100svh] w-full object-cover object-top transition-opacity duration-[400ms]"
          style={{ opacity: ready ? 0 : 1 }}
        />
      )}
      {live && mountStage && (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Stage lite={tier === "mobile"} active={active} onReady={() => setReady(true)} onSlow={forced ? undefined : demote} />
          </Suspense>
        </div>
      )}
      {live && (
        <div
          className={`overlay absolute left-1/2 top-[38svh] z-[2] -translate-x-1/2 whitespace-nowrap text-center font-mono text-[11px] uppercase tracking-[0.05em] text-muted transition-opacity duration-500 lg:bottom-6 lg:left-6 lg:top-auto lg:translate-x-0 lg:text-left lg:text-[12px] ${done || scrolled ? "opacity-0" : "opacity-100"} ${done ? "delay-[1400ms]" : ""}`}
        >
          <span className="mr-3">Filling the light</span>
          <span className="tnum text-fg">{String(pct).padStart(3, "0")}%</span>
        </div>
      )}
    </div>
  );
}
