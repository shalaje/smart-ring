import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { scene } from "~/lib/sceneState";
import { Director } from "./Director";

/** One clock: the GSAP ticker (Lenis, ScrollTrigger, counters) also advances every R3F frame. */
export function TickerDriver({ active }: { active: boolean }) {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!active) return;
    const tick = (time: number) => {
      scene.time = time;
      advance(time * 1000);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [active, advance]);
  return null;
}

/** Calls onReady after the first frames; then measures frame rate for the low-power fallback. */
export function Ready({ onReady, onSlow }: { onReady: () => void; onSlow?: () => void }) {
  const n = useRef(0);
  const samples = useRef<number[]>([]);
  useFrame((_, dt) => {
    n.current++;
    if (n.current === 3) onReady();
    // frames 30–120: if the device can't hold ~30 fps, the page swaps to still frames
    if (onSlow && n.current > 30 && n.current <= 120) {
      samples.current.push(dt);
      if (n.current === 120) {
        const s = [...samples.current].sort((a, b) => a - b);
        const median = s[Math.floor(s.length / 2)];
        if (median > 1 / 28) onSlow();
      }
    }
  });
  return null;
}

/** Morning studio light, rendered once into a small cube map (no HDR download). */
export function Studio() {
  return (
    <Environment resolution={128} frames={1}>
      <color attach="background" args={["#CFC5BA"]} />
      <Lightformer form="rect" intensity={2.4} color="#FFF1E2" position={[-3, 3, 3]} scale={[5, 3, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.1} color="#E9EEFF" position={[4, 1, 2]} scale={[3, 4, 1]} target={[0, 0, 0]} />
      <Lightformer form="ring" intensity={1.4} color="#FFE6D2" position={[0, -2, 4]} scale={2} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.6} color="#FFFFFF" position={[0, 4, -3]} scale={[6, 2, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

export default function Stage({ lite, active, onReady, onSlow }: { lite: boolean; active: boolean; onReady: () => void; onSlow?: () => void }) {
  return (
    <Canvas
      aria-hidden
      frameloop="never"
      dpr={lite ? [1, 1.75] : [1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 32, near: 0.05, far: 40, position: [0, 0, 4.6] }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <color attach="background" args={["#F4EFE9"]} />
      <fog attach="fog" args={["#F4EFE9", 8, 26]} />
      <Studio />
      <TickerDriver active={active} />
      <Ready onReady={onReady} onSlow={onSlow} />
      <Director phone={lite} />
    </Canvas>
  );
}
