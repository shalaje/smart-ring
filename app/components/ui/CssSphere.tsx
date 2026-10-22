import { useEffect, useRef } from "react";
import gsap from "gsap";
import { scene } from "~/lib/sceneState";

/**
 * The readiness sphere for still-frame tiers: drawn in the layout's slot with CSS, so it can
 * never drift out of place. With `breathing`, it scales with the real-time breath (+15%).
 */
export function CssSphere({ breathing = false }: { breathing?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!breathing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = () => {
      if (el.current) el.current.style.transform = `scale(${(1 + scene.breath * 0.15).toFixed(4)})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [breathing]);
  return (
    <div
      ref={el}
      aria-hidden
      className="aspect-square h-[79%] max-h-full max-w-[79%] rounded-full bg-[radial-gradient(circle_at_34%_30%,#F3FAF6_0%,#A9D6C6_22%,#7FB5A3_48%,#C98A7A_74%,#8E93E6_100%)] shadow-[inset_-18px_-22px_40px_rgba(29,27,32,0.14),0_30px_60px_-30px_rgba(29,27,32,0.35)]"
    />
  );
}
