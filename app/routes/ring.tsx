import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/ring";
import { FINISHES, MEMBERSHIP, pageMeta, SIZES } from "~/lib/site";
import { ExperienceProvider, useTier } from "~/lib/experience";
import { setFinish, type Finish } from "~/lib/sceneState";
import { Nav } from "~/components/Nav";
import { Button } from "~/components/ui/Button";
import { FinishPicker, useFinish } from "~/components/FinishPicker";
import { Concept } from "~/components/ui/Signal";
import { Footer } from "~/components/Footer";
import { drag } from "~/three/RingStage";

const RingStage = lazy(() => import("~/three/RingStage"));

export const meta: Route.MetaFunction = () =>
  pageMeta("Sela Ring: choose your finish and size (concept)", "Bone ceramic, brushed titanium or black. Choose a finish and size for the Sela Ring, a design concept by Nova Digital Studio.", "/ring");

function Viewer() {
  const tier = useTier();
  const f = useFinish();
  const live = tier === "full" || tier === "mobile";
  const [ready, setReady] = useState(false);
  const last = useRef<{ x: number; t: number } | null>(null);
  const reduce = tier === "still" || (typeof window !== "undefined" && new URLSearchParams(location.search).has("still"));
  return (
    <div
      id="stage"
      className="relative h-[52svh] touch-pan-y overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]"
      onPointerDown={(e) => {
        drag.down = true;
        last.current = { x: e.clientX, t: performance.now() };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.down || !last.current) return;
        const now = performance.now();
        const dx = e.clientX - last.current.x;
        drag.vx = (dx / Math.max(8, now - last.current.t)) * 6;
        drag.y = Math.max(-1, Math.min(1, drag.y + e.movementY * 0.004));
        last.current = { x: e.clientX, t: now };
      }}
      onPointerUp={() => (drag.down = false)}
      onPointerCancel={() => (drag.down = false)}
    >
      <img src={`/posters/ring-${f}.webp`} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[600ms]" style={{ opacity: live && ready ? 0 : 1 }} />
      {live && (
        <Suspense fallback={null}>
          <div className="absolute inset-0">
            <RingStage onReady={() => setReady(true)} autoRotate={!reduce} phone={tier === "mobile"} />
          </div>
        </Suspense>
      )}
      <p className="overlay text-label pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-muted">{live ? "Drag to turn" : "Sela Ring"}</p>
    </div>
  );
}

function Preorder({ finish, size, kit, price }: { finish: Finish; size: number | null; kit: boolean; price: number }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ref, setRef] = useState("");
  const name = FINISHES.find((x) => x.id === finish)!.name;
  const sizeText = kit ? "Sizing kit first" : size ? `Size ${size}` : "";
  const blocked = !kit && !size;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = { kind: "preorder", name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), website: String(fd.get("website") ?? ""), config: `${name} · ${sizeText}`, price: `$${price}` };
    const errs: Record<string, string> = {};
    if (body.name.trim().length < 2) errs.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) errs.email = "Enter a valid email address.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("sending");
    try {
      const r = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) {
        setErrors(j.errors ?? { form: "Something went wrong." });
        setState("error");
        return;
      }
      setRef(j.reference);
      setState("done");
    } catch {
      setErrors({ form: "Could not send right now. Try again in a moment." });
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div role="status" className="mt-6 rounded-card border border-line bg-[var(--bg)] p-5">
        <p className="text-label text-[#4F8C78]">Reserved · concept</p>
        <p className="mt-2 text-[16px]">
          {name}, {sizeText.toLowerCase()}. Reference <span className="tnum font-mono">{ref}</span>.
        </p>
        <p className="mt-2 text-[14px] text-muted">This is a design concept: nothing was charged and no ring will ship.</p>
      </div>
    );

  if (!open)
    return (
      <div className="mt-6">
        <Button className="w-full" onClick={() => setOpen(true)} disabled={blocked} arrow>
          Pre-order · ${price}
        </Button>
        <p className="mt-2 min-h-5 text-center text-[13px] text-muted">{blocked ? "Choose a size, or the free sizing kit." : "No payment taken today · concept"}</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-3">
      <p className="text-[15px]">
        {name} · {sizeText} · <span className="tnum">${price}</span>
      </p>
      {(["name", "email"] as const).map((k) => (
        <div key={k}>
          <label htmlFor={`po-${k}`} className="text-label text-muted">
            {k === "name" ? "Your name" : "Email"}
          </label>
          <input
            id={`po-${k}`}
            name={k}
            type={k === "email" ? "email" : "text"}
            autoComplete={k}
            aria-invalid={!!errors[k]}
            aria-describedby={errors[k] ? `po-${k}-err` : undefined}
            className={`mt-1.5 h-12 w-full rounded-full border bg-[var(--bg)] px-4 text-[16px] outline-none focus:border-fg ${errors[k] ? "border-pulse" : "border-line"}`}
          />
          {errors[k] && (
            <p id={`po-${k}-err`} className="mt-1 text-[13px] text-pulse">
              {errors[k]}
            </p>
          )}
        </div>
      ))}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {errors.form && <p className="text-[13px] text-pulse">{errors.form}</p>}
      <Button type="submit" className="w-full" disabled={state === "sending"} arrow>
        {state === "sending" ? "Reserving…" : "Reserve my ring"}
      </Button>
      <p className="text-center text-[13px] text-muted">Concept: we only log the request. No card, no charge.</p>
    </form>
  );
}

function Panel() {
  const f = useFinish();
  const [size, setSize] = useState<number | null>(null);
  const [kit, setKit] = useState(false);
  const price = FINISHES.find((x) => x.id === f)!.price;

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("finish");
    if (q && FINISHES.some((x) => x.id === q)) setFinish(q as Finish);
  }, []);

  return (
    <div className="rounded-card border border-line bg-surface p-6 lg:p-8">
      <p className="text-label text-muted">Sela Ring · concept</p>
      <h1 className="text-h2 mt-3">Choose your ring.</h1>
      <p className="mt-3 text-[16px] text-muted">Heart, sleep, temperature and blood oxygen, in 3.6 g. Six months of Membership included.</p>
      <p className="mt-6 flex items-baseline gap-3">
        <span className="tnum font-mono text-[40px] font-light leading-none tracking-[-0.04em]" aria-live="polite">
          ${price}
        </span>
        <span className="text-[14px] text-muted">then ${MEMBERSHIP}/mo after six months</span>
      </p>
      <FinishPicker className="mt-8" showPrice={false} />
      <fieldset className="mt-8">
        <legend className="text-label text-muted">
          Size{size && !kit ? <span className="text-fg"> · {size}</span> : null}
        </legend>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SIZES.map((s) => (
            <label key={s} className="relative">
              <input type="radio" name="size" value={s} checked={size === s && !kit} onChange={() => (setSize(s), setKit(false))} className="peer sr-only" />
              <span className="tnum grid h-11 cursor-pointer place-items-center rounded-full border border-line font-mono text-[14px] transition-colors duration-200 hover:border-fg peer-checked:border-fg peer-checked:bg-fg peer-checked:text-[var(--bg)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pulse">
                {s}
              </span>
            </label>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-[15px]">
          <input type="checkbox" checked={kit} onChange={(e) => setKit(e.target.checked)} className="mt-1 size-4 accent-[var(--pulse)]" />
          <span>
            Not sure? Send me the free sizing kit first.
            <span className="block text-[13px] text-muted">Eight plastic rings to wear for a day. Your ring ships when you've picked.</span>
          </span>
        </label>
      </fieldset>
      <Preorder finish={f} size={size} kit={kit} price={price} />
      <div className="mt-8 divide-y divide-line border-y border-line">
        <details id="sizing" className="group">
          <summary className="flex cursor-pointer items-center justify-between py-4 text-[15px] font-medium">
            Size guide<span className="text-muted transition-transform duration-[400ms] group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <p className="pb-5 text-[15px] leading-relaxed text-muted">Sela sits best on your index finger. Sizes follow US ring sizes, 6 to 13. Between two sizes, choose the larger; fingers swell a little at night.</p>
        </details>
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between py-4 text-[15px] font-medium">
            In the box<span className="text-muted transition-transform duration-[400ms] group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <p className="pb-5 text-[15px] leading-relaxed text-muted">The ring, a charging dock, a USB-C cable and a short paper guide. No plastic wrap.</p>
        </details>
      </div>
      <Concept className="mt-5">Concept product · prices and specs are fictional · not a medical device</Concept>
    </div>
  );
}

export default function RingPage() {
  return (
    <ExperienceProvider>
      <Nav />
      <main id="main" className="relative pt-16 lg:pt-0">
        <div className="site grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="-mx-4 md:-mx-6 lg:col-span-7 lg:mx-0">
            <Viewer />
          </div>
          <div className="pb-24 lg:col-span-5 lg:pb-16 lg:pt-28">
            <Panel />
          </div>
        </div>
      </main>
      <Footer />
    </ExperienceProvider>
  );
}
