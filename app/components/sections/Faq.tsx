import { Reveal } from "../ui/Reveal";

const REVIEWS = [
  { q: "I stopped checking my watch at 3 a.m. One number in the morning is all I needed.", by: "M., 34, designer" },
  { q: "It caught four warm nights before I felt the cold coming. I took the week easy.", by: "T., 41, runner" },
  { q: "The breathing thing is silly and I do it every night now.", by: "A., 29, nurse" },
];
const FAQ = [
  { q: "How do I find my size?", a: "Order the free sizing kit first: eight plastic rings, worn for a day on your index finger. Sela runs from size 6 to 13, and the kit is credited against your ring." },
  { q: "How long does the battery last?", a: "Around a week in normal use (concept figure). The dock charges it from empty in about 80 minutes, from 20% in twenty." },
  { q: "Do I need a subscription?", a: "The ring includes six months of Membership: trends, the Readiness score and the breathing guide. After that it is $5.99 a month, and your raw nightly data stays free to view and export." },
  { q: "What if it doesn't fit or I don't like it?", a: "Return it within 30 days for a full refund, or swap the size once for free." },
  { q: "Is Sela a medical device?", a: "No. Sela is a design concept by Nova Digital Studio and makes no medical claims. It is built to help you notice patterns, not to diagnose anything." },
];

export function Faq() {
  return (
    <section id="faq" data-key="faq" aria-labelledby="faq-title" className="relative section-pad">
      <div className="site">
        <Reveal>
          <p className="text-label text-muted">Reviews · concept</p>
          <h2 id="faq-title" className="text-h2 mt-5 max-w-[14ch]">Quiet, they said.</h2>
        </Reveal>
        <ul className="no-bar -mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0" aria-label="Concept reviews">
          {REVIEWS.map((r, i) => (
            <Reveal as="li" key={r.by} delay={i * 100} className="w-[82%] shrink-0 snap-start rounded-card border border-line bg-card p-6 md:w-auto">
              <blockquote className="font-serif text-[25px] leading-[1.2]">“{r.q}”</blockquote>
              <p className="text-label mt-6 text-muted">
                {r.by} · <span className="text-pulse">concept review</span>
              </p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-24 grid grid-cols-12 gap-y-8">
          <h3 className="text-h3 col-span-12 lg:col-span-4">Questions</h3>
          <div className="col-span-12 divide-y divide-line border-y border-line lg:col-span-7 lg:col-start-6">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-[17px] font-medium">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform duration-[400ms] ease-[var(--ease)] group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="max-w-[60ch] pb-6 text-[16px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
