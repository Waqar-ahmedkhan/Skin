import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '@/lib/scroll'
import { products } from '@/data/products'
import { clamp01, damp, lerp, smoothstep } from '@/lib/utils'

function useGlowTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(128, 32, 0, 128, 32, 128)
    grad.addColorStop(0, 'rgba(255, 249, 232, 1)')
    grad.addColorStop(0.25, 'rgba(255, 238, 202, 0.8)')
    grad.addColorStop(0.6, 'rgba(255, 232, 190, 0.25)')
    grad.addColorStop(1, 'rgba(255, 232, 190, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 64)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

interface ScanProps {
  color: string
  ringColor?: string
  radius: number
  centerY: number
  halfSpan: number
}

/** A clean horizontal optical scan line that moves strictly with scroll. */
export function ScanBeam({ color, ringColor, radius, centerY, halfSpan }: ScanProps) {
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  const ring = useRef<THREE.MeshBasicMaterial>(null)
  const sprite = useGlowTexture()

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const g = scrollState.g
    const s = scrollState.scan
    const total = products.length
    const u = clamp01(s) * total
    const idx = Math.min(total - 1, Math.floor(u))
    const local = u - idx

    const globalPresence = smoothstep(1.02, 1.1, g) * (1 - smoothstep(1.88, 1.96, g))
    const scanBeat = smoothstep(0.3, 0.35, local) * (1 - smoothstep(0.65, 0.7, local))
    const presence = globalPresence * scanBeat

    if (!group.current) return
    group.current.visible = presence > 0.01

    const pass = clamp01((local - 0.32) / 0.36)
    const y = centerY + lerp(halfSpan * 0.48, -halfSpan * 0.62, pass)

    group.current.position.y = damp(group.current.position.y, y, 12, dt)
    group.current.scale.setScalar(0.84)
    if (glow.current) glow.current.opacity = presence * 0.78
    if (ring.current) ring.current.opacity = presence * 0.9
  })

  return (
    <group ref={group} position={[0, centerY + halfSpan * 0.78, 0]} renderOrder={5}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.005, 8, 96]} />
        <meshBasicMaterial
          ref={ring}
          color={ringColor ?? color}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
      <sprite scale={[radius * 3.6, 0.24, 1]}>
        <spriteMaterial
          ref={glow}
          map={sprite}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          color={color}
        />
      </sprite>
    </group>
  )
}
