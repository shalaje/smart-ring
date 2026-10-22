import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { channelsAt } from "~/lib/keys";
import { overlay, scene, smooth } from "~/lib/sceneState";
import { nightBg } from "~/lib/night";
import { cutPlane, Ring, ringU, sensorAnchors, sensorGlow } from "./Ring";
import { Glow, makeGlowU, raw, Ripple, rippleU, SleepBands, sleepU } from "./Signals";
import { Sphere, sphereU } from "./Sphere";

const COOL = "#8FAFD8";
const WARM = "#E3A257";
const C = {
  heart: raw("#E8826A"),
  sleep: raw("#A7ABF2"),
  cool: raw(COOL),
  warm: raw(WARM),
  calm: raw("#9CCBBB"),
};
const tintCool = new THREE.Color(COOL);
const tintWarm = new THREE.Color(WARM);

export const haloU = makeGlowU("#E8826A", 0.93, 0.2, 0);
export const tempU = makeGlowU(COOL, 1.15, 0.75, 0.5);
export const sparkU = makeGlowU("#F7C9A8", 0, 0.12, 1);
export const seedU = makeGlowU("#BFE3D6", 0, 0.1, 1);

const v = new THREE.Vector3();
const bg = new THREE.Color();
const tint = new THREE.Color();
const band = new THREE.Color();
const localCut = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

/**
 * Reads the scroll channels every frame and sets the camera, the ring, the light, the
 * night and the sphere. Nothing here owns state: scroll and the clock are the only inputs.
 */
export function Director({ phone }: { phone: boolean }) {
  const { camera, size, scene: three } = useThree();
  const spinGroup = useRef<THREE.Group>(null);
  const tiltGroup = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Group>(null);
  const tempGlow = useRef<THREE.Group>(null);
  const seed = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const par = useRef({ x: 0, y: 0 });
  const appPos = useRef(new THREE.Vector3());
  const appScale = useRef(0.4);

  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    // the clock is stepped by the Controller (it runs even without the canvas)
    const dt = scene.still ? 0 : delta * scene.timeScale;
    const phase = scene.clock % 1;
    const c = channelsAt(scene.scrollY, phone);
    // Contra cover: the ring at dawn with all three signals leaving it as light
    if (scene.shot === "cover") Object.assign(c, { ring: 1, glow: 1, heart: 1, sleep: 0.16, temp: 0.6, warmth: 0.85, merge: 0, point: 0, app: 0, cut: 0, spark: 0, spin: 0, rx: -0.62, ry: 0.32, camZ: 5.6, sx: 0.17, sy: 0 });
    const t = scene.clock;

    // camera: always looks down −z, so the sleep dive is a straight move along the ring's axis
    const k = 1 - Math.exp(-delta * 3);
    par.current.x += ((scene.tilt ? scene.px : 0) - par.current.x) * k;
    par.current.y += ((scene.tilt ? scene.py : 0) - par.current.y) * k;
    cam.position.set(par.current.x * 0.12, -par.current.y * 0.08, c.camZ);
    cam.lookAt(cam.position.x, cam.position.y, c.camZ - 10);
    const W = size.width,
      H = size.height;
    cam.setViewOffset(W, H, -c.sx * W, c.sy * H, W, H);
    cam.updateMatrixWorld();

    // the ring: tilt + a slow turn about the vertical; the turn settles home when spin is 0
    spin.current += dt * c.spin * 0.45;
    if (c.spin < 0.05) {
      const home = Math.round(spin.current / Math.PI) * Math.PI; // the ring looks the same turned half way
      spin.current += (home - spin.current) * (1 - Math.exp(-delta * 1.5));
    }
    const ringS = smooth(Math.min(1, Math.max(0, c.ring)));
    spinGroup.current!.rotation.y = spin.current;
    spinGroup.current!.scale.setScalar(Math.max(0.0001, ringS));
    spinGroup.current!.visible = ringS > 0.002;
    tiltGroup.current!.rotation.set(c.rx + par.current.y * 0.06, c.ry + par.current.x * 0.1, 0);

    // the inner light: coral by day, lavender in sleep, cool→warm with temperature
    band.copy(C.heart).lerp(C.sleep, Math.min(1, c.sleep * 1.4));
    tint.copy(C.cool).lerp(C.warm, c.warmth);
    band.lerp(tint, Math.min(1, c.temp));
    band.lerp(C.calm, Math.min(1, c.merge));
    ringU.uColor.value.copy(band);
    ringU.uGlow.value = c.glow * (0.3 + 0.7 * scene.fill);
    ringU.uBeat.value = scene.beat * (1 - c.sleep * 0.6);
    ringU.uFill.value = scene.fill > 0 ? 1 : scene.loader;
    ringU.uNight.value = scene.night;
    ringU.uTime.value = t;

    // heart ripple
    rippleU.uPhase.value = phase;
    rippleU.uTime.value = t;
    rippleU.uHeart.value = c.heart * scene.fill;
    rippleU.uNight.value = scene.night;

    // sleep tunnel: scrolling rushes the bands toward you
    sleepU.uTime.value = t;
    sleepU.uRush.value = scene.scrollY / Math.max(1, H) * 0.09;
    sleepU.uSleep.value = c.sleep;
    sleepU.uCamZ.value = c.camZ;

    // halo pulse behind the ring, temperature glow, final point
    haloU.uColor.value.copy(band);
    haloU.uStrength.value = c.glow * ringS * (0.12 + scene.beat * 0.22) * (1 - c.temp * 0.7) * scene.fill;
    haloU.uTime.value = t;
    tempU.uColor.value.copy(tint);
    tempU.uStrength.value = c.temp * (0.42 + 0.06 * Math.sin(t * 0.6)) * (1 - c.merge * 0.6);
    tempU.uRadius.value = 1.15 * (1 - c.merge * 0.7);
    tempU.uTime.value = t;
    tempGlow.current!.position.z = -1.1;
    sparkU.uStrength.value = c.spark * (0.75 + 0.15 * Math.sin(t * Math.PI * 0.2));
    sparkU.uWidth.value = 0.09 + 0.03 * scene.breath;
    sparkU.uTime.value = t;

    // night: one value for background, fog and (via the controller) the page text
    bg.setRGB(nightBg[0], nightBg[1], nightBg[2], THREE.SRGBColorSpace);
    tint.copy(tintCool).lerp(tintWarm, c.warmth);
    bg.lerp(tint, c.temp * (0.06 + 0.08 * c.warmth) * (1 - scene.night));
    (three.background as THREE.Color).copy(bg);
    three.fog!.color.copy(bg);
    const fog = three.fog as THREE.Fog;
    fog.near = Math.max(4, c.camZ + 3);
    fog.far = fog.near + 18;
    three.environmentIntensity = 1 - scene.night * 0.6;

    // the sphere: grows from the merge, folds to a point in the ring, then flies into the phone
    sphereU.uTime.value = t;
    sphereU.uBreath.value = scene.breath;
    sphereU.uNight.value = scene.night;
    sphereU.uGlow.value = c.point * 0.6;
    // radius from the layout's slot (share of screen height), so the sphere never overlaps text
    const visH = 2 * Math.abs(c.camZ) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    let s = c.merge * c.sz * visH * (1 + scene.breath * 0.15) + c.point * 0.035;
    const sp = sphere.current!;
    sp.position.set(0, 0, 0);
    if (c.app > 0.001 && overlay.phoneScreen) {
      const r = overlay.phoneScreen.getBoundingClientRect();
      const cx = r.left + r.width / 2,
        cy = r.top + r.height * 0.36;
      v.set((cx / W) * 2 - 1, -(cy / H) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize();
      const dist = (0 - cam.position.z) / v.z;
      appPos.current.copy(cam.position).addScaledVector(v, dist);
      const visibleH = 2 * Math.abs(cam.position.z) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      appScale.current = ((r.width * 0.3) / H) * visibleH;
      const a = smooth(c.app);
      sp.position.lerp(appPos.current, a);
      s = s + (appScale.current * (1 + scene.breath * 0.08) - s) * a;
      sphereU.uGlow.value *= 1 - a;
    }
    sp.scale.setScalar(Math.max(0.0001, s));
    // when folded into the ring the sphere is a seed of light, not an object
    seed.current!.position.copy(sp.position);
    seedU.uStrength.value = c.point * (1 - smooth(c.app)) * (0.7 + scene.beat * 0.25);
    seedU.uTime.value = t;
    sp.visible = s > 0.003;

    // cutaway: clip half the shell in the ring's own frame, light the sensors
    if (c.cut > 0.002) {
      localCut.constant = (1 - smooth(c.cut)) * 1.3 + 0.3;
      cutPlane.copy(localCut).applyMatrix4(tiltGroup.current!.matrixWorld);
    } else cutPlane.constant = 100;
    sensorGlow.v = c.cut;
    // the three sensors sit close together: one tidy column of labels beside their centre
    const show = c.cut > 0.7 && ringS > 0.5;
    if (show && sensorAnchors.length === 3) {
      let mx = -1e9,
        my = 0;
      for (const a of sensorAnchors) {
        a.getWorldPosition(v).project(cam);
        mx = Math.max(mx, ((v.x + 1) / 2) * W);
        my += ((1 - v.y) / 2) * H / 3;
      }
      overlay.sensorLabels.forEach((el, i) => el && (el.style.transform = `translate3d(${mx + 18}px, ${my + (i - 1) * 34}px, 0)`));
    }
    overlay.sensorLabels.forEach((el) => el && (el.style.opacity = show ? "1" : "0"));
  });

  return (
    <>
      <group ref={spinGroup}>
        <group ref={tiltGroup}>
          <Ring lite={phone} />
          <Ripple />
        </group>
      </group>
      <group position={[0, 0, -0.9]}>
        <Glow u={haloU} size={3.6} />
      </group>
      <group ref={tempGlow}>
        <Glow u={tempU} size={8} />
      </group>
      <SleepBands copies={phone ? 7 : 10} />
      <group ref={sphere}>
        <Sphere lite={phone} />
      </group>
      <group position={[0, 0, 0.02]}>
        <Glow u={sparkU} size={1.6} depthTest={false} order={9} />
      </group>
      <group ref={seed}>
        <Glow u={seedU} size={1.2} depthTest={false} order={9} />
      </group>
    </>
  );
}
