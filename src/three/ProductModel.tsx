import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import type { Product } from '@/data/products'
import { getModelPresentation } from '@/lib/productPresentation'
import { hotspots, type Hotspot } from '@/data/hotspots'
import { TubeModel } from './TubeModel'
import { DropperModel } from './DropperModel'
import { getShadowTexture } from './packagingTextures'

interface ProductModelProps {
  product: Product
  isMobile?: boolean
  showHotspots?: boolean
  onHotspot?: (hotspot: Hotspot) => void
  activeHotspot?: string | null
}

export function ProductModel({ product, isMobile = false, showHotspots, onHotspot, activeHotspot }: ProductModelProps) {
  const presentation = getModelPresentation(product.kind)
  const isSerum = product.kind === 'serum'
  const shadow = useMemo(getShadowTexture, [])
  const shadowSize: [number, number] = isSerum ? [1.45, 0.78] : [1.12, 0.62]

  return (
    <group scale={presentation.scale} position={[0, presentation.y, 0]}>
      {isSerum ? <DropperModel product={product} isMobile={isMobile} /> : <TubeModel product={product} />}

      {/* soft contact shadow, anchored to the product so it never floats */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.323, -0.06]} renderOrder={1}>
        <planeGeometry args={shadowSize} />
        <meshBasicMaterial
          map={shadow}
          transparent
          opacity={0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {showHotspots &&
        hotspots[product.kind].map((spot) => {
          const labelLeft = spot.position[0] > -0.05
          return (
            <Html
              key={spot.key}
              position={spot.position}
              center
              zIndexRange={[24, 4]}
              style={{ pointerEvents: 'auto' }}
            >
              <button
                type="button"
                data-ui
                onClick={(event) => {
                  event.stopPropagation()
                  onHotspot?.(spot)
                }}
                aria-label={`${spot.label} detail`}
                className="group relative flex items-center"
              >
                <span className="relative grid size-6 shrink-0 place-items-center">
                  <span
                    className={`absolute size-5 rounded-full border transition-all duration-500 ${
                      activeHotspot === spot.key
                        ? 'scale-110 border-ink/70 bg-cream/70'
                        : 'border-ink/30 bg-cream/40 group-hover:border-ink/70'
                    }`}
                  />
                  <span
                    className="size-1.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                    style={{
                      backgroundColor:
                        activeHotspot === spot.key ? product.palette.ink : product.palette.body,
                    }}
                  />
                </span>
                <span
                  className={`flex items-center gap-1.5 ${
                    labelLeft ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <span className="h-px w-4 bg-ink/30" />
                  <span className="whitespace-nowrap rounded-full border border-ink/10 bg-cream/80 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-ink/70 backdrop-blur-sm transition-colors duration-300 group-hover:bg-ink group-hover:text-cream">
                    {spot.label}
                  </span>
                </span>
              </button>
            </Html>
          )
        })}
    </group>
  )
}
