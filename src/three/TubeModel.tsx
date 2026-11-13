import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { Product } from '@/data/products'
import { finishProps } from './materials'
import { getCrimpBumpTexture, getRibTexture } from './packagingTextures'
import { useLabelTexture } from './useLabelTexture'
import { lerp, smoothstep } from '@/lib/utils'

let cachedTubeGeo: THREE.BufferGeometry | null = null
let cachedCapGeo: THREE.LatheGeometry | null = null

/** Fuller lower body with a soft belly; flattening is confined to the upper shoulder. */
function getTubeProfile(v: number) {
  const heelProgress = Math.min(1, v / 0.11)
  const heel = Math.sqrt(Math.max(0, 1 - (1 - heelProgress) ** 2))
  const flare = smoothstep(0.12, 1, v)
  const pinch = smoothstep(0.62, 1, v)

  return {
    x: lerp(0.345, 0.415, heel) + 0.17 * Math.pow(flare, 1.1),
    z: lerp(lerp(0.235, 0.325, heel), 0.047, pinch) + 0.035 * Math.sin(Math.PI * v),
  }
}

/**
 * Shared parametric flared squeeze-tube geometry built once and reused across
 * all tubes for optimal draw calls and memory efficiency.
 */
function getSharedTubeGeometry() {
  if (cachedTubeGeo) return cachedTubeGeo

  const vSegs = 56
  const uSegs = 80
  const yMin = -0.87
  const yMax = 0.93

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs
    const y = lerp(yMin, yMax, v)

    const { x: rx, z: rz } = getTubeProfile(v)

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs
      const theta = u * Math.PI * 2
      const x = -Math.cos(theta) * rx
      const z = Math.sin(theta) * rz

      positions.push(x, y, z)
      uvs.push(u, v)
    }
  }

  const row = uSegs + 1
  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const i00 = iv * row + iu
      const i10 = i00 + 1
      const i01 = (iv + 1) * row + iu
      const i11 = i01 + 1

      indices.push(i00, i10, i11)
      indices.push(i00, i11, i01)
    }
  }

  // Close both ends so the smaller cap cannot expose an opening in the tube heel.
  const bottomCenter = positions.length / 3
  positions.push(0, yMin, 0, 0, yMax, 0)
  uvs.push(0.25, 0, 0.25, 1)
  for (let iu = 0; iu < uSegs; iu++) {
    indices.push(bottomCenter, iu + 1, iu)
    indices.push(bottomCenter + 1, vSegs * row + iu, vSegs * row + iu + 1)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  const norm = geo.attributes.normal
  for (let iv = 0; iv <= vSegs; iv++) {
    const iStart = iv * row
    const iEnd = iv * row + uSegs
    const nx = (norm.getX(iStart) + norm.getX(iEnd)) * 0.5
    const ny = (norm.getY(iStart) + norm.getY(iEnd)) * 0.5
    const nz = (norm.getZ(iStart) + norm.getZ(iEnd)) * 0.5
    const len = Math.hypot(nx, ny, nz) || 1
    norm.setXYZ(iStart, nx / len, ny / len, nz / len)
    norm.setXYZ(iEnd, nx / len, ny / len, nz / len)
  }
  norm.needsUpdate = true

  cachedTubeGeo = geo
  return geo
}

function getSharedCapGeometry() {
  if (cachedCapGeo) return cachedCapGeo
  const p = (x: number, y: number) => new THREE.Vector2(x, y)
  cachedCapGeo = new THREE.LatheGeometry(
    [
      p(0, -1.32),
      p(0.224, -1.32),
      p(0.25, -1.314),
      p(0.26, -1.292),
      p(0.262, -0.92),
      p(0.258, -0.89),
      p(0.242, -0.875),
      p(0, -0.875),
    ],
    72,
  )
  return cachedCapGeo
}

export function TubeModel({ product }: { product: Product }) {
  const texture = useLabelTexture(product)
  const ribs = useMemo(getRibTexture, [])
  const crimpBump = useMemo(getCrimpBumpTexture, [])
  const tubeGeo = useMemo(getSharedTubeGeometry, [])
  const capGeo = useMemo(getSharedCapGeometry, [])
  const mat = finishProps(product.finish)
  const { palette } = product

  return (
    <group>
      {/* Crisp cylindrical screw cap */}
      <mesh geometry={capGeo} castShadow>
        <meshPhysicalMaterial
          color={palette.cap}
          roughness={0.42}
          clearcoat={0.16}
          clearcoatRoughness={0.32}
          bumpMap={ribs}
          bumpScale={0.0009}
        />
      </mesh>

      {/* Cap-to-shoulder shadow seam ring */}
      <mesh position={[0, -0.878, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.254, 0.005, 8, 56]} />
        <meshStandardMaterial color={palette.capDeep} roughness={0.62} transparent opacity={0.62} />
      </mesh>

      {/* Glossy flared squeeze-tube body with direct screen-printed artwork */}
      <mesh geometry={tubeGeo} castShadow>
        <meshPhysicalMaterial
          map={texture}
          color="#FFFFFF"
          roughness={mat.roughness}
          clearcoat={mat.clearcoat}
          clearcoatRoughness={mat.clearcoatRoughness}
          ior={1.46}
          specularIntensity={0.8}
          envMapIntensity={mat.envMapIntensity}
        />
      </mesh>

      {/* Single-draw-call bump-ribbed pinched crimp seal (replaces 54 meshes) */}
      <group position={[0, 1.01, 0]}>
        <RoundedBox args={[1.19, 0.185, 0.098]} radius={0.014} smoothness={3} castShadow>
          <meshPhysicalMaterial
            color={palette.body}
            roughness={mat.roughness * 0.92}
            clearcoat={mat.clearcoat}
            clearcoatRoughness={mat.clearcoatRoughness}
            ior={1.46}
            specularIntensity={0.8}
            envMapIntensity={mat.envMapIntensity}
            bumpMap={crimpBump}
            bumpScale={0.0085}
          />
        </RoundedBox>
      </group>
    </group>
  )
}
