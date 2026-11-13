import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { products } from '@/data/products'
import type { Hotspot } from '@/data/hotspots'
import { StudioLighting } from './StudioLighting'
import { CameraRig } from './CameraRig'
import { ProductStage } from './ProductStage'

interface SceneProps {
  active: number
  onSelect: (index: number) => void
  showHotspots: boolean
  onHotspot: (hotspot: Hotspot) => void
  activeHotspot: string | null
  isMobile: boolean
}

export function Scene({
  active,
  onSelect,
  showHotspots,
  onHotspot,
  activeHotspot,
  isMobile,
}: SceneProps) {
  const product = products[active]

  return (
    <div className="pointer-events-none fixed inset-0 z-[2]">
      <Canvas
        className="!pointer-events-auto"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.12, 5.6], fov: 32, near: 0.08, far: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <Suspense fallback={null}>
          <StudioLighting tint={product.palette.accent} />
          <CameraRig isMobile={isMobile} />
          <ProductStage
            active={active}
            onSelect={onSelect}
            showHotspots={showHotspots}
            onHotspot={onHotspot}
            activeHotspot={activeHotspot}
            isMobile={isMobile}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
