import { useState } from "react";
import { Link } from "react-router";
import { Logo } from "./ui/Logo";

const COLS = [
  { title: "Sela", links: [["How it works", "/#heart"], ["The ring", "/ring"], ["The app", "/#app"], ["Breathe with me", "/#breathe"]] },
  { title: "Learn", links: [["Science", "/#privacy"], ["Privacy", "/#privacy"], ["Membership · soon", "/#faq"]] },
  { title: "Help", links: [["Sizing", "/ring#sizing"], ["Support · soon", "/#faq"], ["Returns", "/#faq"]] },
];

function Newsletter() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr(true), setMsg("Enter a valid email address.");
    setErr(false);
    try {
      const r = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "newsletter", email }) });
      if (!r.ok) throw new Error();
      setMsg("Subscribed. One calm letter a month.");
    } catch {
      setErr(true);
      setMsg("Could not subscribe right now.");
    }
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="nl" className="text-label text-muted">Morning notes, monthly</label>
      <div className="mt-3 flex gap-2">
        <input id="nl" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={err} aria-describedby="nl-msg" className={`h-12 min-w-0 flex-1 rounded-full border bg-card px-4 text-[16px] outline-none placeholder:text-muted/70 focus:border-fg ${err ? "border-pulse" : "border-line"}`} />
        <button type="submit" className="h-12 rounded-full bg-fg px-5 text-[15px] font-medium text-[var(--bg)]">Subscribe</button>
      </div>
      <p id="nl-msg" role="status" className={`mt-2 min-h-5 text-[13px] ${err ? "text-pulse" : "text-muted"}`}>{msg}</p>
    </form>
  );
}

export function Footer() {
  return (
    <footer id="footer" data-key="footer" className="relative z-10 pt-[42svh] lg:pt-[52vh]">
      <div className="site border-t border-line pb-24 pt-12 lg:pb-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-[30ch] text-[17px] text-muted">If we can make a ring feel this calm, imagine what we can build for your product.</p>
            <a href="https://novadigital.studio" className="mt-4 inline-block text-[15px] text-pulse underline underline-offset-4">Work with Nova Digital Studio</a>
          </div>
          <nav aria-label="Footer" className="lg:col-span-5">
            <div className="hidden grid-cols-3 gap-6 md:grid">
              {COLS.map((c) => (
                <div key={c.title}>
                  <h3 className="text-label text-muted">{c.title}</h3>
                  <ul className="mt-3 space-y-2 text-[15px]">{c.links.map(([l, h]) => <li key={l}><Link to={h} className="transition-colors duration-200 hover:text-pulse">{l}</Link></li>)}</ul>
                </div>
              ))}
            </div>
            <div className="divide-y divide-line border-y border-line md:hidden">
              {COLS.map((c) => (
                <details key={c.title} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-4">{c.title}<span className="text-muted transition-transform duration-[400ms] group-open:rotate-45" aria-hidden>+</span></summary>
                  <ul className="space-y-3 pb-5 text-muted">{c.links.map(([l, h]) => <li key={l}><Link to={h}>{l}</Link></li>)}</ul>
                </details>
              ))}
            </div>
          </nav>
          <div className="lg:col-span-3"><Newsletter /></div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-5 text-[13px] text-muted md:flex-row md:justify-between">
          <p>Sela is a design concept by <span className="text-fg">Nova Digital Studio</span>. Fictional product; not a medical device. All figures, scores, reviews and prices are concept content.</p>
          <p>© 2026</p>
        </div>
      </div>
    </footer>
  );
}
