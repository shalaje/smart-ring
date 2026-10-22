import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTier } from "~/lib/experience";
import { channelsAt, keys, measureKeys, sectionAt, sectionY } from "~/lib/keys";
import { overlay, scene } from "~/lib/sceneState";
import { scrollToY } from "~/lib/scroll";

export const SIGNALS = [
  { key: "heart", label: "Heart", color: "var(--pulse)" },
  { key: "sleep", label: "Sleep", color: "var(--sleep)" },
  { key: "temp", label: "Temperature", color: "var(--warm)" },
  { key: "ready", label: "Readiness", color: "var(--calm)" },
  { key: "breathe", label: "Breathe", color: "var(--calm)" },
];

/**
 * The master timeline (one ScrollTrigger, scrub 1) and everything on the same clock: keyframe
 * measuring, the shared night value, the beating signal dots and the signal pill.
 */
export function Controller() {
  const tier = useTier();
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    if (tier === "pending") return;
    const onRefresh = () => measureKeys();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    measureKeys();
    const tw = gsap.to(scene, {
      scrollY: () => keys.max,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: tier === "full" ? 1 : 0.6, invalidateOnRefresh: true, onUpdate: (s) => (scene.velocity = s.getVelocity()) },
    });

    const root = document.documentElement;
    let night = -1;
    let nightTw: gsap.core.Tween | null = null;
    const paint = () => root.style.setProperty("--n", scene.night.toFixed(3));
    let lastIdx = -2;
    const tick = () => {
      // one night value: target from the scroll channels, eased over ~1.2 s like a room dimming
      const target = channelsAt(scene.scrollY, scene.phone).night > 0.5 ? 1 : 0;
      if (target !== night) {
        night = target;
        root.classList.toggle("night", target === 1);
        nightTw?.kill();
        nightTw = gsap.to(scene, { night: target, duration: 1.2, ease: "sine.inOut", onUpdate: paint });
      }
      const sec = sectionAt(window.scrollY);
      const i = SIGNALS.findIndex((s) => s.key === sec);
      if (i !== lastIdx) setIdx((lastIdx = i));
      if (overlay.beatDots.size) {
        const o = (0.35 + 0.65 * Math.min(1, scene.beat)).toFixed(2);
        overlay.beatDots.forEach((el) => (el.style.opacity = o));
      }
    };
    gsap.ticker.add(tick);
    const t = setTimeout(() => ScrollTrigger.refresh(), 700);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      clearTimeout(t);
      gsap.ticker.remove(tick);
      nightTw?.kill();
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, [tier]);

  const cur = SIGNALS[idx];
  const go = (d: number) => {
    const n = SIGNALS[Math.min(SIGNALS.length - 1, Math.max(0, idx + d))];
    const y = sectionY(n.key);
    if (y != null) scrollToY(y, n.key);
  };

  return (
    <nav
      aria-label="Signals"
      className={`fixed inset-x-0 bottom-4 z-40 flex justify-center transition-[opacity,transform] duration-[400ms] ease-[var(--ease)] lg:bottom-6 ${cur ? "" : "pointer-events-none translate-y-3 opacity-0"}`}
      aria-hidden={!cur}
    >
      <div className="flex h-11 items-center gap-1 rounded-full border border-line bg-card/85 px-1 text-fg shadow-[0_6px_30px_-12px_rgba(29,27,32,0.35)] backdrop-blur-md">
        <button type="button" tabIndex={cur ? 0 : -1} onClick={() => go(-1)} disabled={idx <= 0} aria-label="Previous signal" className="grid size-9 place-items-center rounded-full transition-colors duration-200 hover:bg-fg/10 disabled:opacity-30">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M8.5 3 4.5 7l4 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </button>
        <span className="flex min-w-[132px] items-center justify-center gap-2 px-1" aria-live="polite">
          <span className="size-1.5 rounded-full" style={{ background: cur?.color }} />
          <span className="text-label !text-[11.5px]">{cur?.label ?? "Heart"}</span>
          <span className="text-label tnum !text-[11.5px] text-muted">{idx >= 0 ? `${idx + 1}/${SIGNALS.length}` : ""}</span>
        </span>
        <button type="button" tabIndex={cur ? 0 : -1} onClick={() => go(1)} disabled={idx >= SIGNALS.length - 1} aria-label="Next signal" className="grid size-9 place-items-center rounded-full transition-colors duration-200 hover:bg-fg/10 disabled:opacity-30">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="m5.5 3 4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </button>
      </div>
    </nav>
  );
}
