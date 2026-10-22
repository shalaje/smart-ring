import { overlay } from "~/lib/sceneState";

/** Signal label: a small coloured dot (beating with the ring on Heart), mono name, one-line value. */
export function Signal({ name, value, color, beat = false, className = "" }: { name: string; value: React.ReactNode; color: string; beat?: boolean; className?: string }) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span
        ref={(el) => {
          if (!beat || !el) return;
          overlay.beatDots.add(el);
          return () => void overlay.beatDots.delete(el);
        }}
        className="relative top-[-1px] size-2 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="text-label text-muted">{name}</span>
      <span className="tnum font-mono text-[15px] text-fg">{value}</span>
    </div>
  );
}

/** Concept honesty: every figure is fictional. */
export function Concept({ className = "", children = "Concept figures, not measurements" }: { className?: string; children?: React.ReactNode }) {
  return <p className={`text-label !text-[11px] text-muted ${className}`}>{children}</p>;
}
