# Sela: Smart Ring Website (Concept)

A design concept by Nova Digital Studio. Sela is a fictional smart ring. It is not a medical device: every figure, score, review and price on the site is concept content.

## Stack
React 19 · TypeScript · Vite · React Router v7 (pre-rendered: `/`, `/ring`, `/404`) · Tailwind CSS v4 · React Three Fiber + Drei · custom GLSL · GSAP ScrollTrigger · Lenis (desktop) · Vercel function (`api/demo.ts`).

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in build/client
```
Deploy on Vercel as is (`vercel.json`: framework none, output `build/client`). The pre-order and newsletter forms post to `api/demo.ts`; set `RESEND_API_KEY` and `ORDERS_TO_EMAIL` to get the requests by email, otherwise they are only logged.

## How the light works
- **The ring** (`app/three/Ring.tsx`) is built in code, not modelled: a lathed squircle profile (outer shell), a thin glass band inside it that carries the light, and three sensor bumps. Finishes are material swaps (bone ceramic, brushed titanium with anisotropy, black). No model file to download.
- **Signals** (`app/three/Signals.tsx`), each one cheap mesh with its own shader:
  - Heart: rings of light leave the rim on every beat (~60 bpm), drawn on a single plane.
  - Sleep: four noisy bands, one per stage, repeated down a tunnel along the ring's axis in one instanced draw call. The camera dives through the ring into it and the page turns to night.
  - Temperature: a soft cool-to-warm glow behind the ring that also tints the room.
- **Readiness** (`app/three/Sphere.tsx`): an icosphere pushed by noise in the vertex shader, with the three signal colours swirling over calm green. After Breathe it folds into the ring as a point of light, then flies into the phone mockup's screen. The canvas reads the screen's position from the DOM every frame.
- **Breathe with me** (`app/three/clock.ts`): holding the button eases a shared `timeScale` to a third (heartbeat, waves, glow and sphere all slow down) and drives `breath` on a 4 s in / 6 s out cycle. It works with keyboard (Space or Enter) as well as touch and mouse.
- **Scroll** (`app/lib/keys.ts`): every section is tagged `data-key`. Keyframes are full sets of channels (light, colour, camera, cutaway), re-measured on every ScrollTrigger refresh, so one scroll value drives the 3D, the night and the signal pill. Heart, Sleep, Temperature, Readiness and Breathe hold their content with CSS `position: sticky` while their scene plays. Readiness merges over the end of Temperature.
- **Night**: one `night` value (0–1) fades the canvas background, the fog and the page text and cards (CSS `--n`) together over 1.2 s.
- **One clock**: R3F `frameloop="never"`, advanced from the GSAP ticker, which also steps Lenis, ScrollTrigger, the heartbeat dots and the breathe button. The render loop pauses when the tab is hidden.
- **Loader**: the ring's inner light fills around the band from 0 to 100% while the scene loads.
- **Signal pill** (`app/components/Controller.tsx`): "‹ Heart ›" follows scroll; its arrows scroll to the previous or next signal. It doubles as the chapter pill.

## Phones, reduced motion and weak devices
- Phones run the same live scene, framed smaller and higher (the 3D owns the top 40% of the screen), with standard instead of physical materials, fewer sleep bands and a lighter sphere. Nothing uses real transmission; the glass is a fresnel shader everywhere.
- After load the page samples frame times. If the median is under ~28 fps, the canvas is swapped for still frames of each scene (`public/posters/*-d.webp`, `*-m.webp`), which crossfade as you scroll.
- `prefers-reduced-motion`, no WebGL or a software renderer: the same still frames, and the breathe button becomes a static guide.
- Brief deviation: the brief asked for pre-rendered video loops as the fallback. This build uses still frames, because the loops need recording on a real GPU. Recording six short loops and swapping `<img>` for `<video>` in `SceneLayer.tsx` is the upgrade path.
- Brief deviation: Framer Motion is not used. UI motion is CSS transitions with the brand easing plus the GSAP ticker, which keeps one clock and saves about 40 KB.

## Weight
3D chunk ~1.0 MB raw / ~270 KB gzip (three, R3F, Drei's environment); the ring itself is code, so it costs 0 KB of model. Fonts are self-hosted (Instrument Serif, Inter, JetBrains Mono).

## Testing notes
Built and checked in headless Chromium with a software renderer, at 1440×900 and 390×844. Frame rates on real GPUs and real phones have not been measured yet, so check them on a mid-range Android before publishing.

## Debug switches
- `?tier=full|mobile|still|poster` forces a tier (and turns off the frame-rate fallback).
- `?shot=1` hides the page and shows only the canvas (used to render the still frames).

## Replace before publishing
- `SITE.url` in `app/lib/site.ts` once deployed (canonical and OG links use it).
- Check that the name Sela is free to use for your portfolio piece.
