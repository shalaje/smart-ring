import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { scene, type Finish } from "~/lib/sceneState";
import { stepClock } from "./clock";
import { Ring, ringU } from "./Ring";
import { Glow, makeGlowU } from "./Signals";
import { Ready, Studio, TickerDriver } from "./Stage";

const halo = makeGlowU("#E8826A", 0.93, 0.22, 0);
export const drag = { x: 0, y: 0, vx: 0, down: false };

function Turntable({ autoRotate }: { autoRotate: boolean }) {
  const g = useRef<THREE.Group>(null);
  const yaw = useRef(0.5);
  useFrame((_, dt) => {
    stepClock();
    if (!drag.down) {
      drag.vx *= Math.exp(-dt * 3);
      yaw.current += drag.vx * dt + (autoRotate ? dt * 0.25 : 0);
    } else yaw.current += drag.vx * dt;
    g.current!.rotation.set(-0.95 + drag.y * 0.4, yaw.current, 0);
    ringU.uGlow.value = 0.75;
    ringU.uBeat.value = scene.beat;
    ringU.uFill.value = 1;
    ringU.uTime.value = scene.clock;
    halo.uStrength.value = 0.1 + scene.beat * 0.18;
  });
  return (
    <group ref={g}>
      <Ring lite={false} finish={undefined} />
    </group>
  );
}

/** The ring page viewer: the same ring, turning; drag to turn it yourself. */
export default function RingStage({ onReady, autoRotate, phone }: { onReady: () => void; autoRotate: boolean; phone: boolean; finish?: Finish }) {
  return (
    <Canvas
      aria-hidden
      frameloop="never"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, stencil: false }}
      camera={{ fov: 30, near: 0.05, far: 30, position: [0, 0, phone ? 4.6 : 4.1] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
      }}
    >
      <color attach="background" args={["#F4EFE9"]} />
      <Studio />
      <TickerDriver active />
      <Ready onReady={onReady} />
      <group position={[0, 0, -0.9]}>
        <Glow u={halo} size={3.6} />
      </group>
      <Turntable autoRotate={autoRotate} />
    </Canvas>
  );
}
