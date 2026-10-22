import { useTier } from "~/lib/experience";
import { overlay } from "~/lib/sceneState";
import { Reveal } from "../ui/Reveal";

const CALLOUTS = [
  { k: "Morning score", t: "One number when you wake, and one sentence on why it is what it is." },
  { k: "Sleep and trends", t: "This week against your own normal, never against someone else's." },
  { k: "Gentle nudges", t: "“Three late nights in a row. Wind down a little earlier tonight?” Never more than one a day." },
];

/** The phone mockup. Its screen is a window: the readiness sphere flies in from the canvas behind. */
function Phone() {
  const tier = useTier();
  const live = tier === "full" || tier === "mobile";
  return (
    <div className="relative mx-auto w-[min(76vw,300px)]" aria-label="The Sela app on a phone: morning score 84, Ready (concept screen)" role="img">
      <div className="relative aspect-[9/19] rounded-[48px] border-[9px] border-ink bg-transparent shadow-[0_40px_80px_-40px_rgba(29,27,32,0.45)]">
        <div ref={(el) => void (overlay.phoneScreen = el)} className="phone-glass absolute inset-0 overflow-hidden rounded-[39px]">
          <div className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
          <div className="flex items-center justify-between px-7 pt-3 font-mono text-[11px] text-ink">
            <span className="tnum">7:12</span>
            <span>●●●</span>
          </div>
          <div className="px-6 pt-8 text-ink">
            <p className="text-label !text-[10px] text-ink-muted">Thursday 22 Oct</p>
            <p className="mt-1 font-serif text-[26px] leading-none">Good morning</p>
          </div>
          {!live && <div className="absolute left-1/2 top-[36%] size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#E9F3EE,#9CCBBB_45%,#7FB5A3_70%,#E3A257)] shadow-[inset_-8px_-10px_20px_rgba(29,27,32,0.12)]" />}
          <div className="absolute inset-x-0 top-[52%] text-center text-ink">
            <p className="tnum font-mono text-[44px] font-light leading-none tracking-[-0.04em]">84</p>
            <p className="font-serif text-[18px] italic text-[#4F8C78]">Ready</p>
          </div>
          <div className="absolute inset-x-4 bottom-4 space-y-2">
            <div className="rounded-2xl bg-surface/90 p-3 text-ink">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.05em] text-ink-muted">
                <span>Sleep</span>
                <span className="tnum text-ink">7 h 42</span>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full">
                <span className="bg-[#DCDDFB]" style={{ width: "7%" }} />
                <span className="bg-[#B0B3F3]" style={{ width: "23%" }} />
                <span className="bg-[#8E93E6]" style={{ width: "50%" }} />
                <span className="bg-[#6B70D1]" style={{ width: "20%" }} />
              </div>
            </div>
            <div className="rounded-2xl bg-surface/90 p-3 text-[12px] leading-snug text-ink">You ran a little warm last night. An easy morning might suit you.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSection() {
  return (
    <section id="app" data-key="app" aria-labelledby="app-title" className="relative section-pad">
      <div className="site">
        <Reveal className="mx-auto max-w-[30ch] text-center">
          <p className="text-label text-muted">The app</p>
          <h2 id="app-title" className="text-h2 mt-5">Mornings, explained in plain words.</h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:mt-20 lg:grid-cols-12">
          <ul className="order-2 space-y-10 lg:order-1 lg:col-span-3">
            {CALLOUTS.slice(0, 2).map((c, i) => (
              <Reveal as="li" key={c.k} delay={i * 120}>
                <p className="text-label text-muted">0{i + 1} · {c.k}</p>
                <p className="mt-3 text-[17px] leading-relaxed">{c.t}</p>
              </Reveal>
            ))}
          </ul>
          <div className="order-1 lg:order-2 lg:col-span-4 lg:col-start-5">
            <Phone />
          </div>
          <ul className="order-3 lg:col-span-3 lg:col-start-10">
            <Reveal as="li" delay={240}>
              <p className="text-label text-muted">03 · {CALLOUTS[2].k}</p>
              <p className="mt-3 text-[17px] leading-relaxed">{CALLOUTS[2].t}</p>
            </Reveal>
          </ul>
        </div>
        <p className="text-label mt-14 text-center !text-[11px] text-muted">Concept screens · App for iOS and Android in the full build</p>
      </div>
    </section>
  );
}
