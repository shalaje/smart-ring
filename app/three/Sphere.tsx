import { useMemo } from "react";
import * as THREE from "three";
import { SNOISE } from "./noise";

export const sphereU = {
  uTime: { value: 0 },
  uBreath: { value: 0 },
  uMix: { value: 1 }, // how strongly the three signal colours swirl over calm
  uNight: { value: 0 },
  uGlow: { value: 0 }, // a point of light: when the sphere is tiny it reads as glow, not shape
};

/**
 * Readiness: one soft sphere. An icosphere pushed by noise in the vertex shader; the heart,
 * sleep and temperature colours swirl on its surface over the calm "ready" green.
 */
export function Sphere({ lite }: { lite: boolean }) {
  const { geo, mat } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, lite ? 28 : 56);
    const mat = new THREE.ShaderMaterial({
      uniforms: sphereU,
      vertexShader: /* glsl */ `
        ${SNOISE}
        uniform float uTime, uBreath;
        varying vec3 vObj; varying vec3 vN; varying vec3 vV;
        float field(vec3 n) {
          return snoise(n * 1.05 + vec3(0.0, uTime * 0.14, uTime * 0.05)) * (0.065 + uBreath * 0.025)
               + snoise(n * 2.2 - vec3(uTime * 0.18, 0.0, 0.0)) * 0.012;
        }
        void main() {
          vec3 n = normalize(position);
          float h = field(n);
          vec3 p = n * (1.0 + h);
          // normal from the displaced field: two tangent samples
          vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
          vec3 b = cross(n, t);
          float e = 0.06;
          vec3 pt = normalize(n + t * e); pt *= 1.0 + field(pt);
          vec3 pb = normalize(n + b * e); pb *= 1.0 + field(pb);
          vec3 nn = normalize(cross(pt - p, pb - p));
          if (dot(nn, n) < 0.0) nn = -nn;
          vObj = n;
          vN = normalize(normalMatrix * nn);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vV = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        ${SNOISE}
        uniform float uTime, uMix, uNight, uBreath, uGlow;
        varying vec3 vObj; varying vec3 vN; varying vec3 vV;
        void main() {
          vec3 calm = vec3(0.52, 0.76, 0.68);
          vec3 heart = vec3(0.91, 0.51, 0.42);
          vec3 sleep = vec3(0.56, 0.58, 0.90);
          vec3 warm = vec3(0.89, 0.64, 0.34);
          // slow, large swirls: domain-warped so the colours flow like liquid rather than spot
          vec3 q = vObj * 0.75 + 0.35 * vec3(snoise(vObj * 0.6 + uTime * 0.05), snoise(vObj * 0.6 + 4.0 - uTime * 0.04), 0.0);
          float a = snoise(q + vec3(0.0, uTime * 0.07, 0.0));
          float b = snoise(q + vec3(5.2, -uTime * 0.06, 1.3));
          float c = snoise(q + vec3(-3.1, 2.0, uTime * 0.05));
          vec3 col = calm;
          col = mix(col, heart, smoothstep(0.0, 0.85, a) * 0.85 * uMix);
          col = mix(col, sleep, smoothstep(0.05, 0.85, b) * 0.85 * uMix);
          col = mix(col, warm, smoothstep(0.1, 0.9, c) * 0.75 * uMix);
          col = mix(col, vec3(0.97, 0.95, 0.92), 0.06);
          vec3 N = normalize(vN), V = normalize(vV);
          vec3 L = normalize(vec3(-0.45, 0.75, 0.55));
          float diff = 0.62 + 0.38 * max(dot(N, L), 0.0);
          float spec = pow(max(dot(N, normalize(L + V)), 0.0), 40.0) * 0.25;
          float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
          vec3 lit = col * diff + spec + fres * vec3(1.0, 0.97, 0.93) * (0.5 + uNight * 0.2);
          lit += col * uBreath * 0.08;
          lit = mix(lit, vec3(1.0, 0.95, 0.88), uGlow);
          gl_FragColor = vec4(lit, 1.0);
        }`,
    });
    return { geo, mat };
  }, [lite]);
  return <mesh geometry={geo} material={mat} />;
}
