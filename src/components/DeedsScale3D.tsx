import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface DeedsScale3DProps {
  goodCount: number;
  badCount: number;
}

function ScaleModel({ goodCount, badCount }: { goodCount: number; badCount: number }) {
  const beamRef = useRef<THREE.Group>(null);
  
  // Weights calculations
  const maxTilt = Math.PI / 6; // 30 degrees
  const tiltFactor = 0.05;
  const rawTilt = (badCount - goodCount) * tiltFactor; // Bad on left (-x), Good on right (+x)
  // If bad is larger, rawTilt is positive. We want left side (-x) to go down.
  // Positive rotation around Z is counter-clockwise, meaning left side goes down.
  const targetTilt = Math.max(-maxTilt, Math.min(maxTilt, rawTilt));

  const baseSphereSize = 0.5;
  const goodSize = baseSphereSize + Math.min(Math.sqrt(goodCount) * 0.2, 2);
  const badSize = baseSphereSize + Math.min(Math.sqrt(badCount) * 0.2, 2);

  useFrame((state, delta) => {
    if (beamRef.current) {
      // Smoothly interpolate rotation
      beamRef.current.rotation.z = THREE.MathUtils.damp(beamRef.current.rotation.z, targetTilt, 4, delta);
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Base */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 1, 3, 32]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Beam Pivot */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.3, 32, 16]} />
        <meshStandardMaterial color="#4338ca" roughness={0.4} />
      </mesh>

      {/* Beam Group */}
      <group position={[0, 3, 0]} ref={beamRef}>
        {/* The Arm */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.2, 0.5]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.4} />
        </mesh>

        {/* Left Hanger (Bad) - x = -3 */}
        <group position={[-3, 0, 0]}>
          {/* Strings */}
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Plate */}
          <mesh position={[0, -2, 0]}>
             <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
             <meshStandardMaterial color="#f87171" roughness={0.5} />
          </mesh>
          {/* Bad Sphere (Variable size) */}
          {badCount > 0 && (
            <mesh position={[0, -2 + badSize/2 + 0.05, 0]}>
              <sphereGeometry args={[badSize/2, 32, 32]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
          )}
        </group>

        {/* Right Hanger (Good) - x = 3 */}
        <group position={[3, 0, 0]}>
          {/* Strings */}
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Plate */}
          <mesh position={[0, -2, 0]}>
             <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
             <meshStandardMaterial color="#4ade80" roughness={0.5} />
          </mesh>
          {/* Good Sphere (Variable size) */}
          {goodCount > 0 && (
            <mesh position={[0, -2 + goodSize/2 + 0.05, 0]}>
              <sphereGeometry args={[goodSize/2, 32, 32]} />
              <meshStandardMaterial color="#22c55e" roughness={0.2} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

export function DeedsScale3D({ goodCount, badCount }: DeedsScale3DProps) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <ScaleModel goodCount={goodCount} badCount={badCount} />
        
        <ContactShadows resolution={512} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
      </Canvas>
    </div>
  );
}
