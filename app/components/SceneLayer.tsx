import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTier } from "~/lib/experience";
import { scene } from "~/lib/sceneState";
import { sectionAt } from "~/lib/keys";

const Stage = lazy(() => import("~/three/Stage"));

/** Still frame per section for reduced motion, no WebGL, or a device that can't hold 30 fps. */
const STILL: Record<string, string | null> = {
  hero: "hero", heart: "heart", sleep: "sleep", temp: "temp", ready: "ready", breathe: "ready",
  ring: "ring", app: null, privacy: "privacy", faq: null, footer: "footer",
};

/**
 * The single persistent canvas behind the page: every section is transparent and the ring is
 * always there. The loader is the ring's own inner light filling 0 → 100%.
 */
export function SceneLayer() {
  const tier = useTier();
  const [slow, setSlow] = useState(false);
  const live = (tier === "full" || tier === "mobile") && !slow;
  const [mountStage, setMountStage] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [pct, setPct] = useState(0);
  const [still, setStill] = useState<string | null>("hero");
  const counter = useRef({ v: 0 });
  const [forced, setForced] = useState(false);
  const [phone, setPhone] = useState(false);
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
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // still frames follow the section in view
  useEffect(() => {
    if (live || tier === "pending") return;
    let last = "";
    const tick = () => {
      const s = STILL[sectionAt(window.scrollY)] ?? null;
      const k = s ?? "";
      if (k !== last) setStill((last = k) || null);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [live, tier]);

  const done = pct >= 100;
  const suffix = phone ? "m" : "d";
  return (
    <div id="stage" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100svh] bg-[var(--bg)]" aria-hidden>
      {!live &&
        Object.values(STILL)
          .filter((v, i, a) => v && a.indexOf(v) === i)
          .map((k) => (
            <img
              key={k}
              src={`/posters/${k}-${suffix}.webp`}
              alt=""
              loading={k === "hero" ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-[var(--ease)]"
              style={{ opacity: still === k ? 1 : 0 }}
            />
          ))}
      {live && mountStage && (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Stage lite={tier === "mobile"} active={active} onReady={() => setReady(true)} onSlow={forced ? undefined : () => setSlow(true)} />
          </Suspense>
        </div>
      )}
      {live && (
        <div className={`overlay absolute bottom-6 left-1/2 -translate-x-1/2 text-center font-mono text-[12px] uppercase tracking-[0.05em] text-muted transition-opacity duration-700 lg:left-6 lg:translate-x-0 lg:text-left ${done ? "opacity-0 delay-[1400ms]" : "opacity-100"}`}>
          <span className="mr-3">Filling the light</span>
          <span className="tnum text-fg">{String(pct).padStart(3, "0")}%</span>
        </div>
      )}
    </div>
  );
}
