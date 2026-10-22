/** Sela mark: a ring with its inner light, and a serif wordmark. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="11" cy="11" r="5.3" stroke="var(--pulse)" strokeWidth="1" opacity="0.85" />
      </svg>
      <span className="font-serif text-[27px] leading-none tracking-[-0.01em]">Sela</span>
    </span>
  );
}
