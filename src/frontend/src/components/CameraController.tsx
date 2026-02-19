import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function CameraController() {
  const { camera } = useThree();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Create smooth, non-repeating orbital motion with varying speeds
    const radius = 5 + Math.sin(t * 0.15) * 1.5;
    const elevation = Math.sin(t * 0.1) * 0.8 + Math.cos(t * 0.07) * 0.5;
    const azimuth = t * 0.2 + Math.sin(t * 0.13) * 0.5;

    // Calculate camera position
    const x = radius * Math.cos(azimuth) * Math.cos(elevation);
    const y = radius * Math.sin(elevation) + Math.sin(t * 0.08) * 0.3;
    const z = radius * Math.sin(azimuth) * Math.cos(elevation);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
