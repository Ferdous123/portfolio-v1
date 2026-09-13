"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AircraftProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  crashed?: boolean;
  crashProgress?: number; // 0-1
  scale?: number;
}

export function Aircraft({
  position,
  rotation = [0, 0, 0],
  color,
  crashed = false,
  crashProgress = 0,
  scale = 1,
}: AircraftProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    if (crashed && crashProgress > 0) {
      // Tumble: spin on multiple axes
      groupRef.current.rotation.x += 0.08 * crashProgress;
      groupRef.current.rotation.z += 0.12 * crashProgress;
    }
  });

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.4,
    metalness: 0.3,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.6),
    roughness: 0.6,
    metalness: 0.2,
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Fuselage */}
      <mesh material={mat} castShadow>
        <boxGeometry args={[1.8, 0.22, 0.22]} />
      </mesh>

      {/* Nose cone */}
      <mesh
        material={mat}
        position={[1.1, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        castShadow
      >
        <coneGeometry args={[0.11, 0.35, 6]} />
      </mesh>

      {/* Wings */}
      <mesh material={mat} position={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 2.4]} />
      </mesh>

      {/* Tail fin (vertical) */}
      <mesh material={darkMat} position={[-0.85, 0.2, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.04]} />
      </mesh>

      {/* Tail fins (horizontal) */}
      <mesh material={darkMat} position={[-0.85, 0.04, 0]} castShadow>
        <boxGeometry args={[0.3, 0.04, 0.85]} />
      </mesh>

      {/* Engine nacelles */}
      {[0.8, -0.8].map((z, i) => (
        <mesh key={i} material={darkMat} position={[0.05, -0.1, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.5, 6]} />
        </mesh>
      ))}
    </group>
  );
}
