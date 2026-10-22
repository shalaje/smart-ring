/**
 * A sticky scene section: tall, with its content held on screen while the 3D plays its moment.
 * Desktop: text in columns 1–5, the ring centre-right. Phones: the ring owns the top 40svh.
 */
export function SceneSection({
  id,
  label,
  height = "lg:h-[220svh] h-[190svh]",
  children,
  className = "",
  align = "left",
  fade,
  afterNight = false,
}: {
  id: string;
  label: string;
  height?: string;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center";
  /** "inFrom,inTo|outFrom,outTo": scrubbed opacity, see Controller */
  fade?: string;
  /** stay hidden until the night has fully lifted */
  afterNight?: boolean;
}) {
  return (
    <section id={id} data-key={id} aria-labelledby={`${id}-title`} aria-label={label} className={`relative ${height} ${className}`}>
      <div data-fade={fade} data-after-night={afterNight || undefined} className={`hold flex ${align === "left" ? "items-start lg:items-center" : "items-stretch"}`}>
        {children}
      </div>
    </section>
  );
}
