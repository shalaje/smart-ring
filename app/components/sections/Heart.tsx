import { SceneSection } from "./Scene";
import { Eyebrow, Reveal } from "../ui/Reveal";
import { Concept, Signal } from "../ui/Signal";

export function Heart() {
  return (
    <SceneSection id="heart" label="Heart" fade="-9,-8|0.8,0.97">
      <div className="site grid grid-cols-12 phone-gap">
        <Reveal className="col-span-12 lg:col-span-5">
          <Eyebrow n="01">Heart</Eyebrow>
          <h2 id="heart-title" className="text-h2 mt-5 max-w-[14ch]">Every beat, read from your finger.</h2>
          <p className="text-body mt-6 measure text-muted max-lg:hidden">
            Light sensors on the inside of the ring follow the blood in your finger through the night, when your body is quiet enough to read clearly.
          </p>
          <div className="mt-8 space-y-3 rounded-card border border-line bg-card/70 p-5 backdrop-blur-sm">
            <Signal name="Resting heart rate" value="58 bpm" color="var(--pulse)" beat />
            <Signal name="Heart rate variability" value="46 ms" color="var(--pulse)" />
            <p className="border-t border-line pt-3 text-[14.5px] leading-relaxed text-muted">
              HRV is the tiny change in time between beats. Above your usual often means you have recovered; below it can follow stress, a late night or a hard week.
            </p>
          </div>
          <Concept className="mt-3" />
        </Reveal>
      </div>
    </SceneSection>
  );
}
