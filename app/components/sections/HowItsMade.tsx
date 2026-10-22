import { Reveal } from "../ui/Reveal";

const LINES = [
  ["Stack", "React 19 · TypeScript · Vite · React Router v7 (pre-rendered) · Tailwind v4"],
  ["Ring", "Built in code: a lathed squircle profile, a glass inner band, three sensors; finishes are material swaps"],
  ["Light", "Ripple, sleep tunnel, temperature glow and breathing sphere are custom GLSL on cheap meshes"],
  ["Night", "One value fades the canvas, the fog and the page text together over 1.2 s"],
  ["Clock", "GSAP ticker drives Lenis, ScrollTrigger, the 3D frame, the heartbeat and the breath"],
  ["Phones", "Same live scene, lighter materials; still frames if the phone can't hold 30 fps"],
];

export function HowItsMade() {
  return (
    <section id="made" aria-labelledby="made-title" className="relative pb-8 pt-24 lg:pt-32">
      <div className="site grid grid-cols-12">
        <Reveal className="col-span-12 lg:col-span-7">
          <p className="text-label text-muted">How it's made</p>
          <h2 id="made-title" className="text-h3 mt-4">Light, liquid and one soft sphere, light enough for a phone.</h2>
          <ul className="mt-6 space-y-2 font-mono text-[12.5px] leading-[1.6]">
            {LINES.map(([k, v]) => (
              <li key={k} className="grid grid-cols-[72px_1fr] gap-3">
                <span className="uppercase tracking-[0.05em] text-muted">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] text-muted">
            Concept, copy, design and build by <span className="text-fg">Nova Digital Studio</span>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
