import { useMemo } from 'react'
import * as THREE from 'three'
import type { Product } from '@/data/products'
import { glassProps } from './materials'
import { useLabelTexture } from './useLabelTexture'
import { smoothstep } from '@/lib/utils'

let cachedFlutedGlassGeo: THREE.BufferGeometry | null = null
let cachedCollarGeo: THREE.LatheGeometry | null = null
let cachedBulbGeo: THREE.LatheGeometry | null = null
let cachedLiquidGeo: THREE.LatheGeometry | null = null

/** A continuous outer wall, neck rim, inner wall, and thick glass base. */
function getFlutedBottleGeo() {
  if (cachedFlutedGlassGeo) return cachedFlutedGlassGeo

  const profilePts = [
    new THREE.Vector2(0.001, -1.32),
    new THREE.Vector2(0.35, -1.32),
    new THREE.Vector2(0.42, -1.31),
    new THREE.Vector2(0.445, -1.27),
    new THREE.Vector2(0.448, -1.16),
    new THREE.Vector2(0.448, 0.06),
    new THREE.Vector2(0.435, 0.13),
    new THREE.Vector2(0.385, 0.2),
    new THREE.Vector2(0.3, 0.26),
    new THREE.Vector2(0.21, 0.31),
    new THREE.Vector2(0.19, 0.35),
    new THREE.Vector2(0.19, 0.46),
    new THREE.Vector2(0.155, 0.46),
    new THREE.Vector2(0.155, 0.35),
    new THREE.Vector2(0.175, 0.31),
    new THREE.Vector2(0.25, 0.24),
    new THREE.Vector2(0.345, 0.17),
    new THREE.Vector2(0.397, 0.08),
    new THREE.Vector2(0.4, -0.04),
    new THREE.Vector2(0.4, -1.15),
    new THREE.Vector2(0.38, -1.22),
    new THREE.Vector2(0.33, -1.235),
    new THREE.Vector2(0.001, -1.235),
    new THREE.Vector2(0.001, -1.32),
  ]

  const lathe = new THREE.LatheGeometry(profilePts, 120)
  const pos = lathe.attributes.position

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    if (r < 0.42) continue

    // Apply graceful 20-rib fluting along the cylindrical glass wall
    const band = smoothstep(-1.18, -1.04, y) * (1 - smoothstep(0.0, 0.12, y))
    if (band > 0.001) {
      const theta = Math.atan2(z, x)
      const rib = (0.5 + 0.5 * Math.cos(theta * 20)) * 0.013 * band
      const scale = (r + rib) / r
      pos.setX(i, x * scale)
      pos.setZ(i, z * scale)
    }
  }

  pos.needsUpdate = true
  lathe.computeVertexNormals()
  cachedFlutedGlassGeo = lathe
  return lathe
}

function getLiquidGeometry() {
  if (cachedLiquidGeo) return cachedLiquidGeo
  const p = (x: number, y: number) => new THREE.Vector2(x, y)
  cachedLiquidGeo = new THREE.LatheGeometry([
    p(0, -1.215), p(0.3, -1.215), p(0.36, -1.2), p(0.386, -1.16),
    p(0.387, 0.015), p(0.385, 0.055), p(0.34, 0.049), p(0.22, 0.045), p(0, 0.045),
  ], 64)

  return cachedLiquidGeo
}

function getCollarGeo() {
  if (cachedCollarGeo) return cachedCollarGeo
  const p = (x: number, y: number) => new THREE.Vector2(x, y)
  cachedCollarGeo = new THREE.LatheGeometry(
    [
      p(0, 0.28),
      p(0.228, 0.28),
      p(0.232, 0.31),
      p(0.232, 0.54),
      p(0.215, 0.57),
      p(0.165, 0.58),
      p(0, 0.58),
    ],
    64,
  )
  return cachedCollarGeo
}

function getBulbGeo() {
  if (cachedBulbGeo) return cachedBulbGeo
  const p = (x: number, y: number) => new THREE.Vector2(x, y)
  cachedBulbGeo = new THREE.LatheGeometry(
    [
      p(0, 0.56),
      p(0.155, 0.56),
      p(0.168, 0.62),
      p(0.172, 0.72),
      p(0.162, 0.84),
      p(0.14, 0.94),
      p(0.105, 1.01),
      p(0.055, 1.055),
      p(0, 1.068),
    ],
    64,
  )
  return cachedBulbGeo
}

export function DropperModel({ product, isMobile }: { product: Product; isMobile: boolean }) {
  const texture = useLabelTexture(product)
  const bottleGeo = useMemo(getFlutedBottleGeo, [])
  const collarGeo = useMemo(getCollarGeo, [])
  const bulbGeo = useMemo(getBulbGeo, [])
  const liquidGeo = useMemo(getLiquidGeometry, [])
  const { palette } = product

  return (
    <group>
      {/* One shaped volume includes the rounded heel and a gently raised meniscus. */}
      <mesh geometry={liquidGeo} renderOrder={1}>
        <meshPhysicalMaterial
          color={palette.bodyLight}
          roughness={0.24}
          clearcoat={0.45}
          clearcoatRoughness={0.16}
          ior={1.46}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* Slender frosted internal glass pipette stem */}
      <mesh position={[0, -0.35, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.03, 0.018, 1.38, 18]} />
        <meshPhysicalMaterial
          color="#FFFDF8"
          roughness={0.08}
          clearcoat={1}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Desktop refraction; narrow screens use the lighter alpha-glass treatment. */}
      <mesh geometry={bottleGeo} renderOrder={3} castShadow>
        <meshPhysicalMaterial {...glassProps(isMobile)} />
      </mesh>

      {/* Direct crisp screen-printed typography curved 360° onto glass */}
      <mesh position={[0, -0.54, 0]} renderOrder={4}>
        <cylinderGeometry args={[0.464, 0.464, 1.02, 72, 1, true, -Math.PI / 2, Math.PI * 2]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          roughness={0.28}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Slim brushed champagne-brass neck collar */}
      <mesh geometry={collarGeo} castShadow>
        <meshStandardMaterial
          color="#DFC9AA"
          metalness={0.88}
          roughness={0.3}
          envMapIntensity={1.1}
        />
      </mesh>
      <mesh position={[0, 0.295, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.005, 8, 48]} />
        <meshStandardMaterial color="#BFA482" metalness={0.9} roughness={0.22} />
      </mesh>

      {/* Sculpted matte silicone dropper bulb */}
      <mesh geometry={bulbGeo} castShadow>
        <meshPhysicalMaterial
          color={palette.cap}
          roughness={0.54}
          clearcoat={0.08}
        />
      </mesh>
    </group>
  )
}
