import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useThemeColors } from '../hooks/useThemeColors';

export default function Scene3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors = useThemeColors();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      timeRef.current += delta;
      const t = timeRef.current;
      
      // Gentle rotation on multiple axes
      meshRef.current.rotation.x = t * 0.15;
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.z = t * 0.1;
      
      // Subtle scale pulsing
      const scale = 1 + Math.sin(t * 0.5) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Directional lights with neon colors */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} color={colors.chart1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.8} color={colors.chart3} />
      <directionalLight position={[0, 5, -5]} intensity={0.6} color={colors.chart5} />
      
      {/* Point lights for extra glow */}
      <pointLight position={[3, 0, 3]} intensity={1.5} color={colors.primary} distance={10} />
      <pointLight position={[-3, 0, -3]} intensity={1.5} color={colors.accent} distance={10} />
      
      {/* Main geometric shape - Torus Knot for interesting complexity */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 32, 3, 4]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.primary}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>
      
      {/* Additional geometric elements for depth */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color={colors.chart2}
          emissive={colors.chart4}
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.4}
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      
      {/* Fog for depth and atmosphere */}
      <fog attach="fog" args={[colors.primary, 5, 15]} />
    </>
  );
}
