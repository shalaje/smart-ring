import { useEffect, useState } from "react";
import { FINISHES } from "~/lib/site";
import { onFinish, scene, setFinish, type Finish } from "~/lib/sceneState";

export function useFinish() {
  const [f, setF] = useState<Finish>(scene.finish);
  useEffect(() => onFinish(setF), []);
  return f;
}

/** Finish swatches: a radio group; the 3D ring changes material live. */
export function FinishPicker({ showPrice = true, className = "" }: { showPrice?: boolean; className?: string }) {
  const f = useFinish();
  const cur = FINISHES.find((x) => x.id === f)!;
  return (
    <fieldset className={className}>
      <legend className="text-label text-muted">
        Finish · <span className="text-fg">{cur.name}</span>
        {showPrice && <span className="tnum text-fg"> · ${cur.price}</span>}
      </legend>
      <div className="mt-4 flex gap-3">
        {FINISHES.map((x) => (
          <label key={x.id} className="group relative cursor-pointer">
            <input type="radio" name="finish" value={x.id} checked={f === x.id} onChange={() => setFinish(x.id)} className="peer sr-only" />
            <span
              className="block size-12 rounded-full border border-line shadow-[inset_0_-3px_6px_rgba(0,0,0,0.12)] ring-offset-[3px] ring-offset-[var(--bg)] transition-[box-shadow] duration-200 peer-checked:ring-2 peer-checked:ring-pulse peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[6px] peer-focus-visible:outline-pulse"
              style={{ background: x.swatch }}
            />
            <span className="sr-only">
              {x.name}, ${x.price}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
