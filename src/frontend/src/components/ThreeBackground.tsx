import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Scene3D from './Scene3D';
import CameraController from './CameraController';

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [5, 2, 5], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        style={{ 
          background: 'transparent',
          pointerEvents: 'none'
        }}
      >
        <Suspense fallback={null}>
          <Scene3D />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}
