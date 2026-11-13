import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { products } from '@/data/products'
import type { Hotspot } from '@/data/hotspots'
import { ProductModel } from './ProductModel'
import { scrollState } from '@/lib/scroll'
import { getPresentationSize } from '@/lib/productPresentation'
import { scanTiming } from '@/lib/scanner'
import { interaction } from '@/lib/interaction'
import { damp, lerp, signedOffset, smoothstep } from '@/lib/utils'

interface ProductStageProps {
  active: number
  onSelect: (index: number) => void
  showHotspots: boolean
  onHotspot: (hotspot: Hotspot) => void
  activeHotspot: string | null
  isMobile: boolean
}

interface Layout {
  x: number
  y: number
  z: number
  scale: number
  rotX: number
  rotY: number
  rotZ: number
}

function heroLayout(i: number, active: number, h: number, isMobile: boolean, height = 900): Layout {
  const d = signedOffset(i, active, products.length)
  const ad = Math.abs(d)

  // Present ONLY one hero product on stage; neighbours wait offstage for smooth left/right swaps.
  if (ad > 0.5) {
    return {
      x: d * 6.8,
      y: -0.05,
      z: -2.2,
      scale: 0.001,
      rotX: 0.02,
      rotY: -d * 0.22,
      rotZ: 0,
    }
  }

  const presentation = getPresentationSize(isMobile, height)

  return {
    x: 0,
    y: presentation.y,
    z: 0,
    scale: presentation.scale,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  }
}

function scanLayout(i: number, s: number, isMobile: boolean, height = 900): Layout {
  const N = products.length
  const u = Math.max(0, Math.min(1, s)) * N
  const local = u - i

  // Before this product's beat: keep completely outside the frustum on the LEFT
  if (local <= -0.22) {
    return {
      x: -6.8,
      y: -0.04,
      z: -2.4,
      scale: 0.001,
      rotX: 0.02,
      rotY: 0,
      rotZ: 0,
    }
  }

  // After this product's beat (all except final product): glide completely offstage RIGHT
  if (i < N - 1 && local >= 1.22) {
    return {
      x: 6.8,
      y: -0.04,
      z: -2.4,
      scale: 0.001,
      rotX: 0.02,
      rotY: Math.PI * 2,
      rotZ: 0,
    }
  }

  // Left-to-right arrival (-0.15 -> 0.1). Product 0 begins centered for Hero continuity.
  const enter = i === 0 ? 1 : smoothstep(-0.15, 0.1, local)
  // Left-to-right departure (0.97 -> 1.15). Final product stays centered for Showcase handoff.
  const exit = i === N - 1 ? 0 : smoothstep(0.97, 1.15, local)

  const x = lerp(-4.4, 0, enter) + lerp(0, 4.4, exit)

  const presentation = getPresentationSize(isMobile, height)

  // Smooth 360° rotation: 0° (front) -> 180° (back-side ingredients) -> 360° (front)
  const toBack = smoothstep(scanTiming.turnStart, scanTiming.turnEnd, local)
  const finish360 = smoothstep(scanTiming.returnStart, scanTiming.returnEnd, local)
  const rotY = toBack * Math.PI + finish360 * Math.PI

  return {
    x,
    y: presentation.y,
    z: 0,
    scale: presentation.scale,
    rotX: 0,
    rotY,
    rotZ: 0,
  }
}

function showcaseMobileLayout(i: number, active: number, c: number, height = 900): Layout {
  const offset = signedOffset(i, active, products.length)
  const presentation = getPresentationSize(true, height)
  const outsideCarousel = Math.abs(offset) > 1.5

  return {
    x: offset * 1.18,
    y: presentation.y,
    z: 0,
    scale: outsideCarousel ? 0.001 : presentation.scale,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  }
}

function showcaseLayout(i: number, active: number, c: number, isMobile: boolean, height = 900): Layout {
  if (isMobile) return showcaseMobileLayout(i, active, c, height)

  const offset = i - (products.length - 1) / 2
  const presentation = getPresentationSize(false, height)

  return {
    x: offset * 1.02,
    y: presentation.y,
    z: 0,
    scale: presentation.scale,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  }
}

export function ProductStage({
  active,
  onSelect,
  showHotspots,
  onHotspot,
  activeHotspot,
  isMobile,
}: ProductStageProps) {
  const groups = useRef<Array<THREE.Group | null>>([])
  const pointerDown = useRef<{ x: number; y: number } | null>(null)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)

    const g = scrollState.g
    const h = scrollState.hero
    const s = scrollState.scanVisual
    const c = scrollState.showcase

    const wScan = smoothstep(0.98, 1.025, g)
    const wShow = smoothstep(1.98, 2.06, g)

    const isScanActive = wScan > 0.05 && wShow < 0.95
    const lambda = scrollState.reduced ? 26 : isScanActive ? 9.5 : 6.4
    const rotLambda = scrollState.reduced ? 26 : isScanActive ? 10.5 : 8.5

    products.forEach((_, i) => {
      const group = groups.current[i]
      if (!group) return

      const hero = heroLayout(i, active, h, isMobile, state.size.height)
      const scan = scanLayout(i, s, isMobile, state.size.height)
      const show = showcaseLayout(i, active, c, isMobile, state.size.height)
      const isActive = i === active

      const targetX = lerp(lerp(hero.x, scan.x, wScan), show.x, wShow)
      const targetY = lerp(lerp(hero.y, scan.y, wScan), show.y, wShow)
      const targetZ = lerp(lerp(hero.z, scan.z, wScan), show.z, wShow)
      const targetScale =
        lerp(lerp(hero.scale, scan.scale, wScan), show.scale, wShow)

      // Driven strictly by scroll and user drag — zero idle wobble
      const heroRotY = hero.rotY
      const scanRotY = scan.rotY
      const showRotY =
        show.rotY + Math.PI * 2
      let targetRotY = lerp(lerp(heroRotY, scanRotY, wScan), showRotY, wShow)

      const targetRotX = lerp(lerp(hero.rotX, scan.rotX, wScan), show.rotX, wShow)

      const targetRotZ = lerp(lerp(hero.rotZ, 0, wScan), show.rotZ, wShow)

      if (isActive) {
        targetRotY += interaction.rotation * (1 - wShow) * (1 - wScan)
      }

      group.position.x = damp(group.position.x, targetX, lambda, dt)
      group.position.y = damp(group.position.y, targetY, lambda, dt)
      group.position.z = damp(group.position.z, targetZ, lambda, dt)

      const nextScale = damp(group.scale.x, targetScale, lambda, dt)
      group.scale.setScalar(nextScale)
      group.rotation.x = damp(group.rotation.x, targetRotX, rotLambda, dt)
      group.rotation.y = damp(group.rotation.y, targetRotY, rotLambda, dt)
      group.rotation.z = damp(group.rotation.z, targetRotZ, rotLambda, dt)
      group.visible = nextScale > 0.02
    })
  })

  const handleDown = (event: ThreeEvent<PointerEvent>) => {
    pointerDown.current = { x: event.clientX, y: event.clientY }
  }

  const handleUp = (index: number) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const down = pointerDown.current
    pointerDown.current = null
    if (!down) return
    const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y)
    if (moved > 8) return
    const group = groups.current[index]
    if (!group || group.scale.x < 0.3) return
    if (scrollState.g < 0.985 || scrollState.g >= 1.985) onSelect(index)
  }

  return (
    <group>
      {products.map((product, i) => (
        <group
          key={product.id}
          ref={(node) => {
            groups.current[i] = node
          }}
          onPointerDown={handleDown}
          onPointerUp={handleUp(i)}
        >
          <ProductModel
            product={product}
            isMobile={isMobile}
            showHotspots={showHotspots && i === active}
            onHotspot={onHotspot}
            activeHotspot={activeHotspot}
          />
        </group>
      ))}
    </group>
  )
}
