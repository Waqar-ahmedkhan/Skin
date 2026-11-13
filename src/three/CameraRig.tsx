import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '@/lib/scroll'
import { damp } from '@/lib/utils'

export function CameraRig({ isMobile }: { isMobile: boolean }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0, 0.02, 0))

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const aspect = size.width / Math.max(1, size.height)
    const distance = isMobile ? 8.2 : Math.max(6.6, 6.6 / (2 * Math.tan(Math.PI * 16 / 180) * aspect))
    const lambda = scrollState.reduced ? 30 : 6

    camera.position.x = damp(camera.position.x, 0, lambda, dt)
    camera.position.y = damp(camera.position.y, 0.26, lambda, dt)
    camera.position.z = damp(camera.position.z, distance, lambda, dt)
    camera.lookAt(look.current)

    const perspective = camera as THREE.PerspectiveCamera
    if (perspective.fov !== 32) {
      perspective.fov = 32
      perspective.updateProjectionMatrix()
    }
  })

  return null
}
