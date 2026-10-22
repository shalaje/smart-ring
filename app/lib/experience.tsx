import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { detectTier, type Tier } from "./device";
import { registerGsap, startLenis, stopLenis } from "./scroll";
import { scene } from "./sceneState";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Ctx = createContext<Tier>("pending");
export const useTier = () => useContext(Ctx);

/** Weak-device fallback: the frame-rate check can demote the live tier to still frames. */
const DemoteCtx = createContext<() => void>(() => {});
export const useDemote = () => useContext(DemoteCtx);

/**
 * Decides the experience tier after hydration (the pre-rendered HTML is the poster version),
 * starts Lenis on desktop and wires the cursor tilt.
 */
export function ExperienceProvider({ children, smooth = true }: { children: React.ReactNode; smooth?: boolean }) {
  const [tier, setTier] = useState<Tier>("pending");

  useEffect(() => {
    registerGsap();
    const t = detectTier();
    setTier(t);
    const q = new URLSearchParams(location.search);
    const shot = q.get("shot");
    if (shot) {
      scene.shot = shot as typeof scene.shot;
      document.documentElement.classList.add("capture");
      // stills: never let gsap's lag smoothing slow the clock on a software renderer
      gsap.ticker.lagSmoothing(0);
    }
    // debug tiers (?tier=) and stills run on wall-clock time even on a software renderer
    if (q.has("tier")) gsap.ticker.lagSmoothing(0);
    scene.tilt = t === "full";
    scene.still = t === "still";
    const phoneMq = window.matchMedia("(max-width: 1023px)");
    const setPhone = () => (scene.phone = phoneMq.matches);
    setPhone();
    phoneMq.addEventListener("change", setPhone);
    // native touch scrolling on phones; the address bar must not jolt the ring
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (t === "full" && smooth && !shot) startLenis();
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scene.px = (e.clientX / innerWidth) * 2 - 1;
      scene.py = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      stopLenis();
    };
  }, [smooth]);

  const demote = useCallback(() => {
    scene.tilt = false;
    setTier("poster");
  }, []);

  return (
    <DemoteCtx.Provider value={demote}>
      <Ctx.Provider value={tier}>{children}</Ctx.Provider>
    </DemoteCtx.Provider>
  );
}
