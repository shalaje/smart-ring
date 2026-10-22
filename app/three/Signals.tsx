import { useMemo } from "react";
import * as THREE from "three";
import { SNOISE } from "./noise";

/** Colours for raw shader output: the hex is written to the screen as is (no linear conversion). */
export const raw = (hex: string) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);

/* Every signal is light drawn by a shader on one cheap mesh. Normal (not additive) blending,
   so the light also reads on the pale dawn background, not only at night. */

export const rippleU = {
  uPhase: { value: 0 }, // beat phase 0–1 at ~60 bpm
  uTime: { value: 0 },
  uHeart: { value: 0 },
  uNight: { value: 0 },
  uColor: { value: raw("#C8573D") },
};

/** Heartbeat ripple: rings of light leaving the ring's rim on each beat, on a single plane. */
export function Ripple() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: rippleU,
        vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uPhase, uTime, uHeart, uNight; uniform vec3 uColor;
          varying vec2 vP;
          void main() {
            float d = length(vP);
            float ang = atan(vP.y, vP.x);
            float a = 0.0;
            for (int k = 0; k < 4; k++) {
              float age = uPhase + float(k);
              float r = 1.0 + age * 0.78 + 0.025 * sin(ang * 3.0 + uTime * 0.6 + float(k) * 1.7);
              float w = 0.018 + age * 0.05;
              float fade = pow(max(0.0, 1.0 - age / 4.0), 2.2);
              a += exp(-pow((d - r) / w, 2.0)) * fade;
            }
            a *= smoothstep(0.96, 1.08, d);
            vec3 col = mix(uColor, vec3(1.0, 0.72, 0.62), uNight);
            gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uHeart * 0.62);
          }`,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={3}>
      <planeGeometry args={[9, 9]} />
    </mesh>
  );
}

export const sleepU = {
  uTime: { value: 0 },
  uRush: { value: 0 }, // scroll adds speed: the tunnel rushes while you scroll through it
  uSleep: { value: 0 },
  uCamZ: { value: 5 },
};

/**
 * Sleep waves: four noisy concentric bands, one per stage, repeated down a tunnel along the
 * ring's axis and flowing toward the camera. One instanced draw call.
 */
export function SleepBands({ copies }: { copies: number }) {
  const mesh = useMemo(() => {
    const base = new THREE.RingGeometry(0.988, 1.012, 160, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute("position", base.getAttribute("position"));
    const n = 4 * copies;
    const band = new Float32Array(n);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      band[i] = i % 4;
      phase[i] = (Math.floor(i / 4) + (i % 4) * 0.27) / copies;
    }
    g.setAttribute("iBand", new THREE.InstancedBufferAttribute(band, 1));
    g.setAttribute("iPhase", new THREE.InstancedBufferAttribute(phase, 1));
    g.instanceCount = n;
    const m = new THREE.ShaderMaterial({
      uniforms: sleepU,
      vertexShader: /* glsl */ `
        ${SNOISE}
        attribute float iBand, iPhase;
        uniform float uTime, uRush, uCamZ;
        varying float vFade; varying float vBand;
        void main() {
          float t = fract(iPhase + uTime * 0.028 + uRush);
          float z = mix(-20.0, 5.0, t);
          float rr = length(position.xy);
          vec2 dir = position.xy / rr;
          rr = 1.0 + (rr - 1.0) * (1.0 + iBand * 0.9);
          float R = 1.12 + iBand * 0.26;
          float wob = 1.0 + 0.075 * snoise(vec3(dir * 1.25, uTime * 0.11 + iBand * 3.1 + iPhase * 7.0));
          vec3 p = vec3(dir * R * wob * rr, z);
          vFade = smoothstep(-20.0, -13.0, z) * (1.0 - smoothstep(uCamZ - 2.8, uCamZ - 0.5, z));
          vBand = iBand;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uSleep; varying float vFade; varying float vBand;
        void main() {
          vec3 awake = vec3(0.86, 0.87, 0.99), rem = vec3(0.69, 0.71, 0.96), light = vec3(0.56, 0.58, 0.90), deep = vec3(0.42, 0.44, 0.82);
          vec3 c = vBand < 0.5 ? awake : vBand < 1.5 ? rem : vBand < 2.5 ? light : deep;
          gl_FragColor = vec4(c, vFade * uSleep * 0.85);
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;
    return mesh;
  }, [copies]);
  return <primitive object={mesh} />;
}

export type GlowU = {
  uColor: { value: THREE.Color };
  uStrength: { value: number };
  uRadius: { value: number }; // ring of light radius (world units); 0 = a soft point
  uWidth: { value: number };
  uCore: { value: number }; // filled centre
  uTime: { value: number };
};
export const makeGlowU = (color: string, radius: number, width: number, core: number): GlowU => ({
  uColor: { value: raw(color) },
  uStrength: { value: 0 },
  uRadius: { value: radius },
  uWidth: { value: width },
  uCore: { value: core },
  uTime: { value: 0 },
});

/** A soft radial light on a camera-facing quad: the heart halo, the temperature glow, the final point. */
export function Glow({ u, size, depthTest = true, order = 0 }: { u: GlowU; size: number; depthTest?: boolean; order?: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          ${SNOISE}
          uniform vec3 uColor; uniform float uStrength, uRadius, uWidth, uCore, uTime;
          varying vec2 vP;
          void main() {
            float d = length(vP);
            float n = snoise(vec3(vP * 0.9, uTime * 0.12)) * 0.12;
            float ring = exp(-pow((d - uRadius - n) / uWidth, 2.0));
            float core = exp(-d * d / max(0.0001, uWidth * uWidth * 2.0)) * uCore;
            gl_FragColor = vec4(uColor, clamp(ring + core, 0.0, 1.0) * uStrength);
          }`,
        transparent: true,
        depthWrite: false,
        depthTest,
      }),
    [u, depthTest],
  );
  return (
    <mesh material={mat} renderOrder={order}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}
