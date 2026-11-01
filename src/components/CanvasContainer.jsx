// NEON RIFT - 3D WebGL Canvas Container
import { Canvas } from '@react-three/fiber';
import { GameScene } from '../scenes/GameScene';

export function CanvasContainer({ controlsRef }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        camera={{ position: [0, 3.2, 7.5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <GameScene controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
