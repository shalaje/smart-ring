import { Eyebrow, Reveal } from "../ui/Reveal";

const PROMISES = [
  { k: "Encrypted", t: "On the ring, on your phone and in transit. Your nights are readable by you." },
  { k: "Yours to take", t: "Export everything as a file, or delete it all, in two taps." },
  { k: "Never sold", t: "No ads, no data brokers, no selling your sleep to anyone." },
];
export const SENSORS = [
  { k: "Light sensors", t: "Green and infrared LEDs follow blood flow for heart rate and HRV.", color: "var(--pulse)" },
  { k: "Temperature", t: "A skin sensor logs small changes from your own baseline each night.", color: "var(--warm)" },
  { k: "Blood oxygen", t: "Red and infrared light give an estimate of SpO2 while you sleep.", color: "var(--calm)" },
  { k: "Motion", t: "An accelerometer tells sleep from stillness, and counts your steps.", color: "var(--sleep)" },
];

export function Privacy() {
  return (
    <section id="privacy" data-key="privacy" aria-labelledby="privacy-title" className="relative section-pad">
      <div className="site grid grid-cols-12 phone-gap">
        <div className="col-span-12 lg:col-span-5">
          <Reveal>
            <Eyebrow>Privacy and science</Eyebrow>
            <h2 id="privacy-title" className="text-h2 mt-5 max-w-[12ch]">Your data stays yours.</h2>
          </Reveal>
          <ul className="mt-10 grid gap-3">
            {PROMISES.map((p, i) => (
              <Reveal as="li" key={p.k} delay={i * 100} className="rounded-card border border-line bg-card/80 p-5 backdrop-blur-sm">
                <p className="font-medium">{p.k}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{p.t}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-16">
            <h3 className="text-h3">How the sensors read you</h3>
            <ul className="mt-6 space-y-5">
              {SENSORS.map((s) => (
                <li key={s.k} className="grid grid-cols-[14px_1fr] gap-3">
                  <span className="mt-[7px] size-2 rounded-full" style={{ background: s.color }} aria-hidden />
                  <span>
                    <span className="text-label text-muted">{s.k}</span>
                    <span className="mt-1 block text-[16px] leading-relaxed">{s.t}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="mt-12 rounded-card border border-pulse/40 bg-card/80 p-5">
            <p className="text-label text-pulse">Not a medical device</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              Sela is a design concept. Nothing on this page is medical advice, a diagnosis or a clinical result, and every figure is invented. If something feels wrong, talk to a doctor.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Labels that ride the glowing sensors in the cutaway (placed by the 3D every frame). */
export function SensorLabels({ register }: { register: (i: number, el: HTMLElement | null) => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[5] hidden overflow-hidden lg:block" aria-hidden>
      {SENSORS.slice(0, 3).map((s, i) => (
        <div key={s.k} ref={(el) => register(i, el)} className="absolute left-0 top-0 opacity-0 transition-opacity duration-[400ms] will-change-transform">
          <span className="ml-5 inline-flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-card/85 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.05em] backdrop-blur">
            <span className="size-1.5 rounded-full" style={{ background: s.color }} />
            {s.k}
          </span>
        </div>
      ))}
    </div>
  );
}
