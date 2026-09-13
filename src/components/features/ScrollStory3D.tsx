"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C_SHORT = "#a8a29e"; // warm stone grey (baseline 1)
const C_AVG   = "#c8a97e"; // muted sand (baseline 2)
const C_RISK  = "#6366f1"; // accent indigo (ours)

// ─── Scene geometry constants ─────────────────────────────────────────────────
const STORM_WX = 8;   // world X of storm centre
const STORM_WZ = 0;   // world Z of storm centre
const STORM_WY = 4.0; // world Y of storm centre (altitude)
const STORM_R  = 3.2; // visual radius
const SAFE_MIN = STORM_R + 2.5; // 5.7 — risk-aware path must exceed this

const PAD_Y = -2.95; // landing pad world Y (flat on terrain, slightly above)

// ─── Terrain height function ──────────────────────────────────────────────────
// PlaneGeometry lies in XY plane; we setZ for height.
// After rotation [-π/2,0,0] + position [0,-3,0]:
//   world_x = geo_x,  world_y = geo_z − 3,  world_z = −geo_y
// terrainH(geo_x, geo_y) → height h → world_y = h − 3
function terrainH(gx: number, gy: number): number {
  const ds2 = (gx + 14) ** 2 + gy ** 2;
  const dg2 = (gx - 14) ** 2 + gy ** 2;
  const flat = Math.max(Math.exp(-ds2 * 0.03), Math.exp(-dg2 * 0.03));
  const h =
    Math.sin(gx * 0.15 + 0.5) * 2.2 +
    Math.cos(gy * 0.18)        * 1.5 +
    Math.sin((gx + gy * 0.6) * 0.11) * 1.2 +
    Math.sin(gx * 0.4)         * 0.5;
  return h * (1 - flat);
}

// ─── Route paths ─────────────────────────────────────────────────────────────
// Drones start separated along Z so they read as 3 distinct objects at p=0
function buildPaths() {
  const sy = 2.2; // cruise altitude (world Y)
  const goal = new THREE.Vector3(14, PAD_Y, 0);

  // Shortest: straight into storm core, crashes at ~x=9
  const shortPts = [
    new THREE.Vector3(-14, sy, 1.5),
    new THREE.Vector3(  0, sy, 1.0),
    new THREE.Vector3(  6, sy, 0.5),
    new THREE.Vector3(  8, sy, 0.0), // enters storm
    new THREE.Vector3(  9, sy - 1.2, 0.3), // crash
  ];

  // Average-wind: skirts edge, gust hits it, crashes
  const avgPts = [
    new THREE.Vector3(-14, sy, 0),
    new THREE.Vector3( -5, sy + 0.4, -2.5),
    new THREE.Vector3(  4, sy + 0.3, -3.5),
    new THREE.Vector3(  7.5, sy, -3.0), // approaches edge (dist ≈ 3.0 — inside margin)
    new THREE.Vector3( 10, sy - 1.5, -5.5), // crash
  ];

  // Risk-aware: wide arc, min distance from storm > SAFE_MIN all the way
  // Verified: closest point is [8,sy,8.5] — dist from [8,4,0] = sqrt(0+4+72) ≈ 8.7 > 5.7 ✓
  const riskPts = [
    new THREE.Vector3(-14, sy, -1.5),
    new THREE.Vector3( -7, sy + 0.8, 5.0),
    new THREE.Vector3(  0, sy + 1.5, 8.5),
    new THREE.Vector3(  8, sy + 1.0, 8.5),
    new THREE.Vector3( 13, sy + 0.3, 4.0),
    goal,
  ];

  return { shortPts, avgPts, riskPts, goal };
}

// ─── Path interpolation helpers ───────────────────────────────────────────────
function ptOnPath(pts: THREE.Vector3[], t: number): THREE.Vector3 {
  const n = pts.length - 1;
  const ft = Math.max(0, Math.min(n - 0.0001, t * n));
  const seg = Math.floor(ft);
  return pts[seg].clone().lerp(pts[seg + 1], ft - seg);
}

function dirOnPath(pts: THREE.Vector3[], t: number): THREE.Euler {
  const n = pts.length - 1;
  const ft = Math.max(0, Math.min(n - 0.0001, t * n));
  const seg = Math.floor(ft);
  const a = pts[seg];
  const b = pts[Math.min(seg + 1, n)];
  const d = b.clone().sub(a).normalize();
  if (d.lengthSq() < 0.001) return new THREE.Euler(0, 0, 0);
  return new THREE.Euler(0, -Math.atan2(d.z, d.x), 0);
}

// ─── Terrain ─────────────────────────────────────────────────────────────────
function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(70, 70, 52, 52);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const gx = pos.getX(i);
      const gy = pos.getY(i);
      const h = terrainH(gx, gy);
      pos.setZ(i, h);

      // Vertex colour: low earth → mid green → high rocky
      const t = Math.max(0, Math.min(1, (h + 2) / 5.5));
      let r: number, gr: number, b: number;
      if (t < 0.45) {
        const s = t / 0.45;
        r  = 0.22 + s * (0.28 - 0.22);
        gr = 0.18 + s * (0.42 - 0.18);
        b  = 0.14 + s * (0.20 - 0.14);
      } else {
        const s = (t - 0.45) / 0.55;
        r  = 0.28 + s * (0.44 - 0.28);
        gr = 0.42 + s * (0.39 - 0.42);
        b  = 0.20 + s * (0.32 - 0.20);
      }
      colors[i * 3]     = r;
      colors[i * 3 + 1] = gr;
      colors[i * 3 + 2] = b;
    }

    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.92,
        metalness: 0.0,
      }),
    []
  );

  return (
    <mesh
      geometry={geo}
      material={mat}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3, 0]}
      receiveShadow
    />
  );
}

// ─── Fixed-wing UAV ───────────────────────────────────────────────────────────
function FixedWingUAV({
  pos,
  rot,
  color,
  crashed,
  crashSpin,
  visible,
  accent,
}: {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  color: string;
  crashed: boolean;
  crashSpin: number;
  visible: boolean;
  accent?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const propRef  = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (propRef.current) {
      propRef.current.rotation.x += 12 * dt;
    }
    if (groupRef.current && crashed && crashSpin > 0) {
      groupRef.current.rotation.x += crashSpin * dt * 5;
      groupRef.current.rotation.z += crashSpin * dt * 3;
      groupRef.current.position.y -= crashSpin * dt * 2.5;
    }
  });

  if (!visible) return null;

  const bodyC = color;
  const darkC = new THREE.Color(color).multiplyScalar(0.6).getStyle();
  const accentC = accent ? C_RISK : darkC;

  return (
    <group ref={groupRef} position={pos} rotation={rot}>
      {/* Fuselage */}
      <mesh castShadow>
        <boxGeometry args={[2.0, 0.15, 0.22]} />
        <meshStandardMaterial color={bodyC} roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Nose fairing */}
      <mesh position={[1.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.1, 0.38, 8]} />
        <meshStandardMaterial color={bodyC} roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Main wing (high-aspect, slightly swept back) */}
      <mesh position={[0.05, 0, 0]} rotation={[0, -0.16, 0]} castShadow>
        <boxGeometry args={[0.48, 0.028, 2.8]} />
        <meshStandardMaterial color={bodyC} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Accent stripe on wing */}
      {accent && (
        <mesh position={[0.05, 0.016, 0]} rotation={[0, -0.16, 0]}>
          <boxGeometry args={[0.42, 0.003, 0.5]} />
          <meshStandardMaterial color={C_RISK} roughness={0.2} emissive={C_RISK} emissiveIntensity={0.3} />
        </mesh>
      )}
      {/* V-tail left */}
      <mesh position={[-0.88, 0.12, 0.18]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.025, 0.7]} />
        <meshStandardMaterial color={darkC} roughness={0.4} />
      </mesh>
      {/* V-tail right */}
      <mesh position={[-0.88, 0.12, -0.18]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.025, 0.7]} />
        <meshStandardMaterial color={darkC} roughness={0.4} />
      </mesh>
      {/* Pusher prop disc */}
      <mesh ref={propRef} position={[-1.15, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.02, 14]} />
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.45}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
      {/* Nav lights: port red, starboard green */}
      <mesh position={[0.04, 0.02, 1.42]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.04, 0.02, -1.42]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3} />
      </mesh>
      {/* Tail strobe */}
      <mesh position={[-1.15, 0.06, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={accent ? 4 : 2} />
      </mesh>
    </group>
  );
}

// ─── Storm cell ───────────────────────────────────────────────────────────────
const CLOUD_LOBES = [
  { p: [0, 0, 0],     r: 2.6, s: [1.0, 0.65, 1.0] },
  { p: [-1.5, 0.8, 1.2], r: 1.9, s: [1.0, 0.7, 1.0] },
  { p: [1.4, 0.6, -1.0], r: 2.0, s: [1.0, 0.7, 1.0] },
  { p: [-0.4, 1.6, -0.8], r: 1.6, s: [1.0, 0.65, 1.0] },
  { p: [0.8, -0.3, 1.5], r: 1.7, s: [1.0, 0.6, 1.0] },
  { p: [0, -1.2, 0],  r: 2.2, s: [1.0, 0.55, 1.0] }, // darker underbelly
] as const;

function StormCell({ progress }: { progress: number }) {
  const lightRef  = useRef<THREE.PointLight>(null);
  const rotRef    = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (rotRef.current) rotRef.current.rotation.y = clock.elapsedTime * 0.18;
    if (lightRef.current) {
      const t = clock.elapsedTime;
      const flicker =
        0.5 +
        0.5 *
          Math.abs(
            Math.sin(t * 7.3) *
            Math.sin(t * 13.1) *
            Math.sin(t * 5.7)
          );
      lightRef.current.intensity = progress * flicker * 6;
    }
  });

  if (progress < 0.01) return null;

  return (
    <group position={[STORM_WX, STORM_WY, STORM_WZ]}>
      <group ref={rotRef}>
        {CLOUD_LOBES.map((lobe, i) => (
          <mesh
            key={i}
            position={lobe.p as [number, number, number]}
            scale={lobe.s as [number, number, number]}
          >
            <sphereGeometry args={[lobe.r * progress, 14, 10]} />
            <meshStandardMaterial
              color={i === 5 ? "#1e293b" : "#2d3f52"}
              transparent
              opacity={(i === 5 ? 0.82 : 0.68) * progress}
              roughness={1}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      {/* Lightning point light */}
      <pointLight
        ref={lightRef}
        color="#c4b5fd"
        distance={16}
        decay={2}
      />
    </group>
  );
}

// ─── Wind streamlines ─────────────────────────────────────────────────────────
const N_STREAM = 220;

function WindStreamlines({ stormP }: { stormP: number }) {
  const posRef = useRef<Float32Array>(
    (() => {
      const a = new Float32Array(N_STREAM * 3);
      for (let i = 0; i < N_STREAM; i++) {
        a[i * 3]     = (Math.random() - 0.5) * 44;
        a[i * 3 + 1] = Math.random() * 5 + 0.5;
        a[i * 3 + 2] = (Math.random() - 0.5) * 38;
      }
      return a;
    })()
  );
  const geoRef = useRef<THREE.BufferGeometry>(null);

  useFrame((_, dt) => {
    if (!geoRef.current) return;
    const arr = posRef.current;
    const attr = geoRef.current.attributes.position as THREE.BufferAttribute;
    const fa = attr.array as Float32Array;

    for (let i = 0; i < N_STREAM; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 2];
      const dx = x - STORM_WX;
      const dz = z - STORM_WZ;
      const dist2 = dx * dx + dz * dz + 4;
      const swirl = stormP * 7 * Math.exp(-dist2 * 0.04);

      arr[i * 3]     += (2.8 + swirl * 0.5) * dt;
      arr[i * 3 + 1] += (Math.random() - 0.5) * 0.04;
      arr[i * 3 + 2] += ((-dx / Math.sqrt(dist2)) * swirl - 0.3) * dt;

      if (arr[i * 3] > 22) arr[i * 3] = -22;
      if (arr[i * 3 + 1] < 0.3) arr[i * 3 + 1] = 0.3;
      if (arr[i * 3 + 1] > 7)   arr[i * 3 + 1] = 7;

      fa[i * 3]     = arr[i * 3];
      fa[i * 3 + 1] = arr[i * 3 + 1];
      fa[i * 3 + 2] = arr[i * 3 + 2];
    }

    attr.needsUpdate = true;
  });

  const geo = useMemo(() => {
    const a = posRef.current;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a.slice(), 3));
    return g;
  }, []);
  // store ref
  useEffect(() => { geoRef.current = geo; }, [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        color="#93c5fd"
        size={0.12}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Smoke puff ───────────────────────────────────────────────────────────────
function SmokePuff({ position, active }: { position: THREE.Vector3; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (!ref.current || !active) return;
    ref.current.scale.addScalar(dt * 0.35);
    if (matRef.current) {
      matRef.current.opacity = Math.max(0, matRef.current.opacity - dt * 0.28);
    }
  });
  if (!active) return null;
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.7, 7, 6]} />
      <meshStandardMaterial
        ref={matRef}
        color="#555"
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Pulsing ring on goal pad ─────────────────────────────────────────────────
function GoalRing({ goal }: { goal: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !matRef.current) return;
    const s = 1 + 0.35 * Math.abs(Math.sin(clock.elapsedTime * 1.4));
    ref.current.scale.setScalar(s);
    matRef.current.opacity = 0.5 * (1 - (s - 1) / 0.35);
  });
  return (
    <mesh ref={ref} position={[goal.x, PAD_Y + 0.06, goal.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 1.55, 32]} />
      <meshBasicMaterial ref={matRef} color="#22c55e" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}

// ─── Camera ───────────────────────────────────────────────────────────────────
function CameraRig({ scrollP, aspect }: { scrollP: number; aspect: number }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 2, 0));

  const fovBase = aspect > 1 ? 50 : 64;
  (camera as THREE.PerspectiveCamera).fov = fovBase;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

  useFrame(() => {
    let cx: number, cy: number, cz: number;
    let tx: number, ty: number, tz: number;

    // During zipper (p 0–0.65): wide establishing
    if (scrollP < 0.65) {
      cx = -18; cy = 12; cz = 20;
      tx = 0; ty = 2; tz = 0;
    } else if (scrollP < 0.8) {
      const t = (scrollP - 0.65) / 0.15;
      cx = -18 + t * 10; cy = 12 - t * 4; cz = 20 - t * 7;
      tx = t * 5; ty = 2; tz = 0;
    } else if (scrollP < 0.92) {
      const t = (scrollP - 0.8) / 0.12;
      cx = -8 + t * 10; cy = 8 + t * 8; cz = 13 - t * 13;
      tx = 5 + t * 3; ty = 2; tz = 0;
    } else {
      // Overhead reveal
      const t = (scrollP - 0.92) / 0.08;
      cx = 0; cy = 16 + t * 8; cz = 0.1;
      tx = 0; ty = 0; tz = 0;
    }

    const lerpK = 0.045;
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), lerpK);
    lookTarget.current.lerp(new THREE.Vector3(tx, ty, tz), lerpK);
    camera.lookAt(lookTarget.current);
  });

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ scrollP, isDark, aspect }: { scrollP: number; isDark: boolean; aspect: number }) {
  const { shortPts, avgPts, riskPts, goal } = useMemo(buildPaths, []);

  const stormP = Math.max(0, Math.min(1, (scrollP - 0.67) / 0.08));

  // Story phase starts at scrollP=0.65
  const storyP = Math.max(0, (scrollP - 0.65) / 0.35);

  const shortCrashAt = 0.4; // within story phase (storyP)
  const avgCrashAt   = 0.6;

  const shortP = Math.min(1, storyP / shortCrashAt);
  const avgP   = Math.min(1, storyP / avgCrashAt);
  const riskP  = Math.min(1, storyP);

  const shortCrashed = storyP > shortCrashAt;
  const avgCrashed   = storyP > avgCrashAt;

  const shortPos = ptOnPath(shortPts, shortCrashed ? 1 : shortP);
  const avgPos   = ptOnPath(avgPts,   avgCrashed   ? 1 : avgP);
  const riskPos  = ptOnPath(riskPts,  Math.min(riskP, 0.998));

  // Build trail sub-paths (points up to current progress)
  function trailPoints(pts: THREE.Vector3[], t: number) {
    const n = pts.length - 1;
    const ft = Math.max(0, Math.min(n - 0.0001, t * n));
    const seg = Math.floor(ft);
    const frac = ft - seg;
    const sub = pts.slice(0, seg + 1);
    if (frac > 0 && seg < n) {
      sub.push(pts[seg].clone().lerp(pts[seg + 1], frac));
    }
    return sub.length >= 2 ? sub : null;
  }

  const shortTrail = trailPoints(shortPts, shortCrashed ? 1 : shortP);
  const avgTrail   = trailPoints(avgPts,   avgCrashed   ? 1 : avgP);
  const riskTrail  = trailPoints(riskPts,  Math.min(riskP, 0.998));

  // Hemisphere & directional colours
  const skyColor    = isDark ? "#1e3a5f" : "#b6d9f0";
  const groundColor = isDark ? "#1a2e1a" : "#4a7040";

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.35 : 0.6} />
      <hemisphereLight
        color={skyColor as THREE.ColorRepresentation}
        groundColor={groundColor as THREE.ColorRepresentation}
        intensity={0.55}
      />
      <directionalLight
        position={[12, 22, 10]}
        intensity={isDark ? 0.9 : 1.3}
        castShadow
      />

      {/* Fog tied to sky gradient */}
      <fog attach="fog" args={[isDark ? "#0d1b36" : "#d0e8f5", 18, 58]} />

      <Terrain />
      <WindStreamlines stormP={stormP} />
      <StormCell progress={stormP} />

      {/* Goal pad: horizontal disc on ground */}
      <mesh position={[goal.x, PAD_Y, goal.z]}>
        <cylinderGeometry args={[1.2, 1.2, 0.07, 24]} />
        <meshStandardMaterial color="#22c55e" roughness={0.4} />
      </mesh>
      <GoalRing goal={goal} />

      {/* Start pad */}
      <mesh position={[-14, PAD_Y, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.07, 24]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>

      {/* Trails */}
      {shortTrail && (
        <Line
          points={shortTrail}
          color={C_SHORT}
          lineWidth={shortCrashed ? 2 : 3}
          transparent
          opacity={shortCrashed ? 0.4 : 0.85}
        />
      )}
      {avgTrail && (
        <Line
          points={avgTrail}
          color={C_AVG}
          lineWidth={avgCrashed ? 2 : 3}
          transparent
          opacity={avgCrashed ? 0.4 : 0.85}
        />
      )}
      {riskTrail && (
        <Line
          points={riskTrail}
          color={C_RISK}
          lineWidth={3.5}
          transparent
          opacity={0.92}
        />
      )}

      {/* Aircraft */}
      <FixedWingUAV
        pos={shortPos}
        rot={dirOnPath(shortPts, shortCrashed ? 0.98 : shortP)}
        color={C_SHORT}
        crashed={shortCrashed}
        crashSpin={shortCrashed ? 1 : 0}
        visible={!shortCrashed || storyP < shortCrashAt + 0.18}
      />
      <FixedWingUAV
        pos={avgPos}
        rot={dirOnPath(avgPts, avgCrashed ? 0.98 : avgP)}
        color={C_AVG}
        crashed={avgCrashed}
        crashSpin={avgCrashed ? 1 : 0}
        visible={!avgCrashed || storyP < avgCrashAt + 0.18}
      />
      <FixedWingUAV
        pos={riskPos}
        rot={dirOnPath(riskPts, Math.min(riskP, 0.998))}
        color={C_RISK}
        crashed={false}
        crashSpin={0}
        visible
        accent
      />

      {/* Crash smoke */}
      <SmokePuff position={ptOnPath(shortPts, 1)} active={shortCrashed} />
      <SmokePuff position={ptOnPath(avgPts, 1)}   active={avgCrashed} />

      <CameraRig scrollP={scrollP} aspect={aspect} />
    </>
  );
}

// ─── Captions ─────────────────────────────────────────────────────────────────
const CAPTIONS = [
  { from: 0.00, to: 0.22, text: "Every flight starts with a forecast." },
  { from: 0.22, to: 0.45, text: "Forecasts are wrong exactly where it matters." },
  { from: 0.45, to: 0.62, text: "Planners built for the average wind fly straight into it." },
  { from: 0.62, to: 0.82, text: "A risk-aware planner prices the worst plausible gust, and flies past it." },
  { from: 0.82, to: 1.00, text: "That is the problem I work on." },
];

function Captions({ scrollP, isDark }: { scrollP: number; isDark: boolean }) {
  const active = CAPTIONS.find((c) => scrollP >= c.from && scrollP <= c.to);
  const fg = isDark ? "#f1f5f9" : "#0f172a";
  const shadow = isDark ? "0 2px 16px rgba(0,0,0,0.9)" : "0 2px 16px rgba(255,255,255,0.95)";
  const bg = isDark
    ? "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)"
    : "linear-gradient(to top, rgba(255,255,255,0.55) 0%, transparent 100%)";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "48px 24px 28px",
        background: bg,
        pointerEvents: "none",
        transition: "opacity 0.4s ease",
        opacity: active ? 1 : 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontSize: "clamp(1.05rem, 2.4vw, 1.5rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          color: fg,
          textShadow: shadow,
          textAlign: "center",
          maxWidth: 680,
          margin: 0,
        }}
      >
        {active?.text ?? ""}
      </p>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend({ isDark }: { isDark: boolean }) {
  const fg = isDark ? "#cbd5e1" : "#374151";
  const bg = isDark ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.72)";
  const items = [
    { color: C_SHORT, label: "Shortest path" },
    { color: C_AVG,   label: "Average-wind planner" },
    { color: C_RISK,  label: "Risk-aware planner (ours)" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        top: 68,
        right: 14,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        pointerEvents: "none",
        background: bg,
        borderRadius: 10,
        padding: "8px 12px",
        backdropFilter: "blur(8px)",
      }}
    >
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 24,
              height: 3,
              background: it.color,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: "ui-monospace, monospace",
              color: fg,
              letterSpacing: "0.04em",
            }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Zipper SVG UAV (HTML layer above page halves) ───────────────────────────
function ZipperUAV({
  x, y, angle, scale, opacity, isDark,
}: {
  x: number; y: number; angle: number; scale: number; opacity: number; isDark: boolean;
}) {
  const w = 140 * scale;
  const h = 56 * scale;
  const bodyColor = isDark ? "#e2e8f0" : "#f8fafc";
  const wingColor = isDark ? "#cbd5e1" : "#e2e8f0";
  const darkColor = isDark ? "#475569" : "#94a3b8";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        opacity,
        pointerEvents: "none",
        zIndex: 20,
        transition: "opacity 0.3s ease",
      }}
    >
      <svg
        viewBox="-70 -28 140 56"
        width={w}
        height={h}
        style={{ overflow: "visible" }}
      >
        {/* Shadow */}
        <ellipse cx="0" cy="4" rx="45" ry="10" fill="rgba(0,0,0,0.15)" />
        {/* Main wing */}
        <polygon
          points="-4,-28 8,-28 12,28 -10,28"
          fill={wingColor}
          transform="translate(4,0) rotate(-8,0,0)"
        />
        {/* Fuselage */}
        <ellipse cx="0" cy="0" rx="48" ry="8" fill={bodyColor} />
        {/* Nose */}
        <ellipse cx="52" cy="0" rx="8" ry="5" fill={bodyColor} />
        {/* Cockpit */}
        <ellipse cx="20" cy="-2" rx="12" ry="4" fill={darkColor} opacity={0.6} />
        {/* V-tail left */}
        <polygon points="-40,-4 -28,-18 -28,-4" fill={darkColor} />
        {/* V-tail right */}
        <polygon points="-40,4 -28,18 -28,4" fill={darkColor} />
        {/* Pusher prop */}
        <ellipse cx="-52" cy="0" rx="12" ry="12" fill="none" stroke={darkColor} strokeWidth="2" opacity={0.5} />
        <line x1="-52" y1="-12" x2="-52" y2="12" stroke={darkColor} strokeWidth="2.5" opacity={0.7} />
        <line x1="-64" y1="0" x2="-40" y2="0" stroke={darkColor} strokeWidth="2.5" opacity={0.7} />
        {/* Nav lights */}
        <circle cx="8" cy="-28" r="4" fill="#ef4444" />
        <circle cx="8" cy="28" r="4" fill="#22c55e" />
        {/* Accent stripe */}
        <rect x="-8" y="-2" width="40" height="4" rx="2" fill={C_RISK} opacity={0.8} />
        {/* Strobe */}
        <circle cx="-48" cy="0" r="3" fill="white" opacity={0.9} />
      </svg>
    </div>
  );
}

// ─── Zipper teeth SVG ─────────────────────────────────────────────────────────
function ZipperTeeth({
  vw, vh, uavFrac, gapHalf, isDark,
}: {
  vw: number; vh: number; uavFrac: number; gapHalf: number; isDark: boolean;
}) {
  const L = Math.sqrt(vw * vw + vh * vh);
  const Nx = vh / L;  // perpendicular x (upper-right)
  const Ny = -vw / L; // perpendicular y (upper-right)

  const toothPitch = 14;
  const toothHeight = 7;
  const openLen = uavFrac * L;
  const nTeeth = Math.max(0, Math.floor((openLen - 20) / toothPitch));

  const teethColor = isDark ? "#475569" : "#94a3b8";
  const meshColor  = isDark ? "#1e293b" : "#f8fafc";

  const upperTeeth: string[] = [];
  const lowerTeeth: string[] = [];

  for (let i = 0; i < nTeeth; i++) {
    const s = i * toothPitch + 8;
    const cx = (s / L) * vw;
    const cy = (s / L) * vh;

    // Upper tooth: triangle pointing into the gap (upper-right direction)
    const bL = cx - (toothPitch / 2) * (vw / L) + Nx * gapHalf;
    const bLy = cy - (toothPitch / 2) * (vh / L) + Ny * gapHalf;
    const bR = cx + (toothPitch / 2) * (vw / L) + Nx * gapHalf;
    const bRy = cy + (toothPitch / 2) * (vh / L) + Ny * gapHalf;
    const tipX = cx + Nx * (gapHalf + toothHeight);
    const tipY = cy + Ny * (gapHalf + toothHeight);
    upperTeeth.push(`M${bL},${bLy} L${bR},${bRy} L${tipX},${tipY}Z`);

    // Lower tooth (interlocked, offset by half pitch)
    const offset = toothPitch / 2;
    const cs = s + offset;
    const ccx = (cs / L) * vw;
    const ccy = (cs / L) * vh;
    const bL2 = ccx - (toothPitch / 2) * (vw / L) - Nx * gapHalf;
    const bLy2 = ccy - (toothPitch / 2) * (vh / L) - Ny * gapHalf;
    const bR2 = ccx + (toothPitch / 2) * (vw / L) - Nx * gapHalf;
    const bRy2 = ccy + (toothPitch / 2) * (vh / L) - Ny * gapHalf;
    const tipX2 = ccx - Nx * (gapHalf + toothHeight);
    const tipY2 = ccy - Ny * (gapHalf + toothHeight);
    lowerTeeth.push(`M${bL2},${bLy2} L${bR2},${bRy2} L${tipX2},${tipY2}Z`);
  }

  if (nTeeth === 0) return null;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: vw,
        height: vh,
        pointerEvents: "none",
        zIndex: 15,
        overflow: "visible",
      }}
    >
      {upperTeeth.map((d, i) => (
        <path key={`u${i}`} d={d} fill={teethColor} opacity={0.9} />
      ))}
      {lowerTeeth.map((d, i) => (
        <path key={`l${i}`} d={d} fill={teethColor} opacity={0.9} />
      ))}
      {/* Seam highlight lines */}
      <line
        x1="0" y1="0"
        x2={uavFrac * vw + Nx * gapHalf}
        y2={uavFrac * vh + Ny * gapHalf}
        stroke={meshColor}
        strokeWidth="1"
        opacity={0.4}
      />
      <line
        x1="0" y1="0"
        x2={uavFrac * vw - Nx * gapHalf}
        y2={uavFrac * vh - Ny * gapHalf}
        stroke={meshColor}
        strokeWidth="1"
        opacity={0.4}
      />
    </svg>
  );
}

// ─── Static fallback ──────────────────────────────────────────────────────────
function StaticFallback({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "#0d1117" : "#e8f4f8";
  const fg = isDark ? "#f1f5f9" : "#0f172a";
  const items = [
    { color: C_SHORT, label: "Shortest path — flies into storm, crashes" },
    { color: C_AVG,   label: "Average-wind planner — skirted edge, crashes" },
    { color: C_RISK,  label: "Risk-aware planner — wide arc, reaches goal" },
  ];
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-border"
      style={{
        background: bg,
        width: "100%",
        aspectRatio: "16/9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "24px 20px",
      }}
    >
      <p
        style={{
          fontSize: "clamp(1rem, 2vw, 1.35rem)",
          fontWeight: 700,
          color: fg,
          textAlign: "center",
          maxWidth: 520,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        A risk-aware planner prices the worst plausible gust, and flies past it.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 3, background: it.color, borderRadius: 2 }} />
            <span style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", color: fg }}>
              {it.label}
            </span>
          </div>
        ))}
      </div>
      <p
        style={{
          position: "absolute",
          bottom: 10,
          right: 14,
          fontSize: 10,
          fontFamily: "ui-monospace, monospace",
          color: isDark ? "#4b5563" : "#9ca3af",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Illustration
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface ScrollStory3DProps {
  /** Called when the WebGL canvas initialises successfully. */
  onReady?: () => void;
}

export default function ScrollStory3D({ onReady }: ScrollStory3DProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollP, setScrollP]       = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible]   = useState(true);
  const [dims, setDims]             = useState({ vw: 1440, vh: 900 });

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // Viewport dims
  useEffect(() => {
    const update = () => setDims({ vw: window.innerWidth, vh: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Offscreen pause
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll progress
  useEffect(() => {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setScrollP(Math.max(0, Math.min(1, scrolled / total)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section className="w-full px-6 lg:px-[8%] py-12">
        <div className="max-w-5xl mx-auto">
          <StaticFallback isDark={isDark} />
        </div>
      </section>
    );
  }

  const { vw, vh } = dims;
  const L = Math.sqrt(vw * vw + vh * vh);
  const Nx = vh / L;
  const Ny = -vw / L;

  // Zipper progress: p 0.15–0.60 → uavFrac 0–1
  const zipperPhase = scrollP < 0.62;
  const uavFrac = Math.max(0, Math.min(1, (scrollP - 0.15) / 0.45));
  const gapHalf = uavFrac * 65; // max gap half = 65px

  // UAV element position (on the diagonal seam)
  const uavX = uavFrac * vw;
  const uavY = uavFrac * vh;
  const diagAngleDeg = (Math.atan2(vh, vw) * 180) / Math.PI;
  const uavScale = 1.0 - uavFrac * 0.5; // 1.0 → 0.5
  const uavOpacity = scrollP < 0.58 ? 1 : Math.max(0, 1 - (scrollP - 0.58) / 0.06);

  // Clip-path polygons for page halves
  // Upper-right triangle (above diagonal): shrinks to area ahead of UAV
  const urPoints = [
    `${(uavX + Nx * gapHalf).toFixed(1)}px ${(uavY + Ny * gapHalf).toFixed(1)}px`,
    `${(vw + Nx * gapHalf).toFixed(1)}px ${(Ny * gapHalf).toFixed(1)}px`,
    `${(vw + Nx * gapHalf).toFixed(1)}px ${(vh + Ny * gapHalf).toFixed(1)}px`,
  ].join(", ");
  const llPoints = [
    `${(uavX - Nx * gapHalf).toFixed(1)}px ${(uavY - Ny * gapHalf).toFixed(1)}px`,
    `${(-Nx * gapHalf).toFixed(1)}px ${(vh - Ny * gapHalf).toFixed(1)}px`,
    `${(vw - Nx * gapHalf).toFixed(1)}px ${(vh - Ny * gapHalf).toFixed(1)}px`,
  ].join(", ");

  const canvasBackground = isDark
    ? "linear-gradient(180deg, #0d1b36 0%, #1a2d4a 45%, #0f2136 100%)"
    : "linear-gradient(180deg, #bfe3f5 0%, #d8ecf5 40%, #edf6fb 100%)";

  const aspect = vw / vh;

  return (
    <section
      ref={containerRef}
      style={{ height: "450vh", position: "relative" }}
      aria-label="Scroll story: three UAV planners in a wind storm"
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [-18, 12, 20], fov: aspect > 1 ? 50 : 64 }}
          shadows
          dpr={[1, aspect > 1 ? 1.75 : 1.25]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: canvasBackground,
          }}
          frameloop={isVisible ? "always" : "never"}
          onCreated={() => onReady?.()}
        >
          <Scene scrollP={scrollP} isDark={isDark} aspect={aspect} />
        </Canvas>

        {/* Page overlay halves (zipper) */}
        {zipperPhase && uavFrac > 0 && (
          <>
            {/* Upper-right half */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: isDark ? "#0f172a" : "#ffffff",
                clipPath: `polygon(${urPoints})`,
                pointerEvents: "none",
              }}
            />
            {/* Lower-left half */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: isDark ? "#0f172a" : "#ffffff",
                clipPath: `polygon(${llPoints})`,
                pointerEvents: "none",
              }}
            />
          </>
        )}
        {/* Fully closed before zipper starts */}
        {zipperPhase && uavFrac === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              background: isDark ? "#0f172a" : "#ffffff",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Zipper teeth */}
        {zipperPhase && uavFrac > 0.05 && (
          <ZipperTeeth
            vw={vw}
            vh={vh}
            uavFrac={uavFrac}
            gapHalf={gapHalf}
            isDark={isDark}
          />
        )}

        {/* Zipper UAV element */}
        {uavOpacity > 0 && (
          <ZipperUAV
            x={uavX}
            y={uavY}
            angle={diagAngleDeg}
            scale={uavScale}
            opacity={uavOpacity}
            isDark={isDark}
          />
        )}

        {/* Captions & legend (always on top) */}
        {scrollP > 0.62 && <Captions scrollP={scrollP} isDark={isDark} />}
        {scrollP > 0.62 && <Legend isDark={isDark} />}

        {/* Illustration tag */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 14,
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            color: isDark ? "#334155" : "#9ca3af",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          Illustration
        </div>

        {/* Scroll hint */}
        {scrollP < 0.04 && (
          <div
            style={{
              position: "absolute",
              bottom: 36,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 11,
              fontFamily: "ui-monospace, monospace",
              color: isDark ? "#475569" : "#9ca3af",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              zIndex: 30,
              pointerEvents: "none",
              animation: "bounce 2s infinite",
            }}
          >
            <span>Scroll</span>
            <span style={{ fontSize: 16 }}>↓</span>
          </div>
        )}
      </div>
    </section>
  );
}
