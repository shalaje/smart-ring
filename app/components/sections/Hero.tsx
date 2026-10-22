import { Button } from "../ui/Button";
import { Concept, Signal } from "../ui/Signal";
import { scrollToId } from "~/lib/scroll";

export function Hero() {
  return (
    <section id="top" data-key="hero" aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-end lg:items-center">
      <div className="site grid grid-cols-12 pb-24 pt-[46svh] lg:pb-0 lg:pt-16">
        <div className="col-span-12 lg:col-span-6 xl:col-span-5">
          <p className="text-label text-muted">Sela Ring · a design concept</p>
          <h1 id="hero-title" className="text-display mt-5 max-w-[11ch]">
            Your body, <em className="italic">quietly</em> understood.
          </h1>
          <p className="text-body mt-6 max-w-[40ch] text-muted">
            A light ring that reads your heart, sleep and temperature while you rest, and gives you one calm number each morning.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button to="/ring" arrow>
              Pre-order
            </Button>
            <Button variant="secondary" href="#heart" onClick={(e) => scrollToId("heart") && e.preventDefault()}>
              How it works
            </Button>
          </div>
          <div className="mt-12 flex flex-col gap-2.5 border-t border-line pt-5 sm:flex-row sm:gap-7">
            <Signal name="Rest HR" value="58 bpm" color="var(--pulse)" beat />
            <Signal name="Sleep" value="7 h 42" color="var(--sleep)" />
            <Signal name="Temp" value="+0.2 °C" color="var(--warm)" />
          </div>
          <Concept className="mt-3" />
        </div>
      </div>
    </section>
  );
}
