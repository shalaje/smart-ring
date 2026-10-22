import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { onFinish, scene, type Finish } from "~/lib/sceneState";
import { raw } from "./Signals";

/**
 * The ring, built in code: a lathed squircle profile (outer shell), a thin glass band on the
 * inside that carries the light, and three sensor bumps. Finishes are material swaps.
 * Local frame: the ring lies in the XY plane, its axis along Z.
 */
export const R_IN = 0.8;
export const R_OUT = 0.97;
export const HALF_W = 0.155;

export const ringU = {
  uGlow: { value: 0.7 }, // inner light strength
  uBeat: { value: 0 }, // heartbeat envelope
  uFill: { value: 1 }, // loader: share of the band lit, 0–1
  uColor: { value: raw("#E8826A") },
  uNight: { value: 0 },
  uOpacity: { value: 1 },
  uTime: { value: 0 },
};

/** world-space clip plane for the cutaway (Director moves it); far away = no cut */
export const cutPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 100);
export const sensorAnchors: THREE.Object3D[] = [];

function ringGeometry(segments: number) {
  const pts: THREE.Vector2[] = [];
  const rc = (R_IN + R_OUT) / 2;
  const t = (R_OUT - R_IN) / 2;
  const N = 72;
  const e = 2 / 5; // squircle exponent: soft, pebble-like edges
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const c = Math.cos(a),
      s = Math.sin(a);
    // the outer face bulges slightly, like a worn band
    const bulge = c > 0 ? 1 + 0.12 * Math.pow(Math.max(0, 1 - Math.abs(s)), 1.5) : 1;
    pts.push(new THREE.Vector2(rc + t * Math.sign(c) * Math.pow(Math.abs(c), e) * bulge, HALF_W * Math.sign(s) * Math.pow(Math.abs(s), e)));
  }
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2);
  return g;
}

export function makeFinish(f: Finish, lite: boolean) {
  const common = { side: THREE.DoubleSide, clippingPlanes: [cutPlane] };
  if (lite) {
    const m = {
      bone: { color: "#ECE4D8", roughness: 0.38, metalness: 0 },
      titanium: { color: "#C9C5BF", roughness: 0.3, metalness: 1 },
      black: { color: "#1E1D22", roughness: 0.3, metalness: 0.45 },
    }[f];
    return new THREE.MeshStandardMaterial({ ...m, ...common });
  }
  const m = {
    // soft, slightly translucent-looking ceramic: sheen + a satin clearcoat, no real transmission
    bone: { color: "#EDE5D9", roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.28, sheen: 0.6, sheenColor: new THREE.Color("#FFF3E6"), sheenRoughness: 0.5 },
    titanium: { color: "#C8C4BE", roughness: 0.3, metalness: 1, anisotropy: 0.75, clearcoat: 0.1 },
    black: { color: "#1C1B20", roughness: 0.34, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 },
  }[f];
  return new THREE.MeshPhysicalMaterial({ ...m, ...common });
}

const bandVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;
const bandFrag = /* glsl */ `
  uniform float uGlow, uBeat, uFill, uNight, uOpacity, uTime; uniform vec3 uColor;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    float edge = smoothstep(0.0, 0.42, vUv.y) * smoothstep(1.0, 0.58, vUv.y);
    float lit = 1.0 - smoothstep(uFill - 0.015, uFill + 0.015, vUv.x);
    float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
    // liquid light: a slow travelling sheen along the band
    float flow = 0.5 + 0.5 * sin(vUv.x * 18.85 - uTime * 0.7);
    float i = (0.18 + uGlow * (0.55 + uBeat * 0.8)) * edge * (0.75 + 0.25 * flow);
    vec3 col = mix(uColor, vec3(1.0, 0.96, 0.9), 0.25 + 0.35 * uBeat) ;
    float a = clamp(i * lit + fres * 0.08, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(col * (1.0 + uNight * 0.3), a);
  }`;

export function Ring({ lite, finish }: { lite: boolean; finish?: Finish }) {
  const shell = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => ringGeometry(lite ? 128 : 200), [lite]);
  const mats = useMemo(() => ({ bone: makeFinish("bone", lite), titanium: makeFinish("titanium", lite), black: makeFinish("black", lite) }), [lite]);
  const band = useMemo(() => {
    const g = new THREE.CylinderGeometry(R_IN - 0.006, R_IN - 0.006, HALF_W * 1.45, lite ? 96 : 160, 1, true);
    g.rotateX(Math.PI / 2);
    const m = new THREE.ShaderMaterial({ uniforms: ringU, vertexShader: bandVert, fragmentShader: bandFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: [cutPlane] });
    return { g, m };
  }, [lite]);
  const sensors = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 24, 12);
    const cols = ["#E8826A", "#E3A257", "#7FB5A3"];
    return cols.map((c, i) => ({ a: (i - 1) * 0.42, m: new THREE.MeshStandardMaterial({ color: "#B9B3AC", roughness: 0.25, metalness: 0.1, emissive: new THREE.Color(c), emissiveIntensity: 0.1 }), g }));
  }, []);

  useEffect(() => {
    const apply = (f: Finish) => shell.current && (shell.current.material = mats[f]);
    apply(finish ?? scene.finish);
    if (finish) return;
    return onFinish(apply);
  }, [mats, finish]);

  useFrame(() => {
    // sensors glow with the cutaway, and beat faintly with the heart
    for (const s of sensors) s.m.emissiveIntensity = 0.05 + sensorGlow.v * (2.4 + ringU.uBeat.value * 1.2);
    for (const o of sensorAnchors) o?.scale.set(0.022 * (1 + sensorGlow.v * 0.2), 0.045 * (1 + sensorGlow.v * 0.25), 0.06 * (1 + sensorGlow.v * 0.15));
  });

  return (
    <group>
      <mesh ref={shell} geometry={geo} material={mats.bone} renderOrder={1} />
      <mesh geometry={band.g} material={band.m} renderOrder={2} />
      {sensors.map((s, i) => (
        <mesh
          key={i}
          ref={(o) => void (o && (sensorAnchors[i] = o))}
          geometry={s.g}
          material={s.m}
          position={[Math.cos(s.a) * (R_IN - 0.012), Math.sin(s.a) * (R_IN - 0.012), 0]}
          scale={[0.022, 0.045, 0.06]}
          rotation={[0, 0, s.a]}
        />
      ))}
    </group>
  );
}

export const sensorGlow = { v: 0 };
