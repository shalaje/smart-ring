import { Button } from "../ui/Button";
import { Eyebrow, Reveal } from "../ui/Reveal";
import { Concept } from "../ui/Signal";
import { FinishPicker, useFinish } from "../FinishPicker";

const BIG = [
  { n: "3.6", u: "g", k: "Weight", d: "Lighter than most wedding bands. You stop noticing it by the second night." },
  { n: "7", u: "days", k: "Battery", d: "A week on one charge, and about 80 minutes on the dock from empty." },
  { n: "100", u: "m", k: "Water resistance", d: "Showers, swims, dishes. Take it off only to charge." },
];

export function RingSection() {
  const f = useFinish();
  return (
    <section id="ring" data-key="ring" aria-labelledby="ring-title" className="relative section-pad">
      <div className="site grid grid-cols-12 phone-gap">
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <Reveal>
            <Eyebrow>The ring</Eyebrow>
            <h2 id="ring-title" className="text-h2 mt-5 max-w-[13ch]">Made to be forgotten on your finger.</h2>
            <p className="text-body mt-6 measure text-muted">A ceramic or titanium shell, a glass inner band, three sensors and nothing that blinks. Pick a finish; the ring changes as you choose.</p>
            <FinishPicker className="mt-8" />
            <div className="mt-8">
              <Button to={`/ring?finish=${f}`} arrow>
                Choose your size
              </Button>
            </div>
          </Reveal>
          <dl className="mt-16 lg:mt-24">
            {BIG.map((b) => (
              <Reveal key={b.k} className="border-t border-line py-10 lg:py-16">
                <dt className="text-label text-muted">{b.k}</dt>
                <dd className="mt-3">
                  <span className="tnum text-[clamp(76px,3rem+6.4vw,140px)] font-[250] leading-none tracking-[-0.05em]">{b.n}</span>
                  <span className="ml-2 font-serif text-[clamp(28px,1rem+2vw,44px)] italic">{b.u}</span>
                  <p className="mt-4 max-w-[36ch] text-[16px] text-muted">{b.d}</p>
                </dd>
              </Reveal>
            ))}
          </dl>
          <Concept>Concept specifications</Concept>
        </div>
      </div>
    </section>
  );
}
