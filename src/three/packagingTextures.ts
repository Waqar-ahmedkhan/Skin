import * as THREE from 'three'

let ribTexture: THREE.CanvasTexture | null = null
let crimpBumpTexture: THREE.CanvasTexture | null = null
let shadowTexture: THREE.CanvasTexture | null = null

/**
 * Procedural bump map used for the fine grip ribs on caps and lids.
 */
export function getRibTexture() {
  if (ribTexture) return ribTexture

  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 16
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#8a8a8a'
  ctx.fillRect(0, 0, 64, 16)
  ctx.fillStyle = '#4a4a4a'
  ctx.fillRect(30, 0, 5, 16)
  ctx.fillStyle = '#b8b8b8'
  ctx.fillRect(35, 0, 2, 16)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(52, 1)
  texture.colorSpace = THREE.NoColorSpace
  ribTexture = texture
  return texture
}

/**
 * Single crisp procedural crimp-tooth ridge bump map (replaces 54 extra box meshes per tube).
 */
export function getCrimpBumpTexture() {
  if (crimpBumpTexture) return crimpBumpTexture

  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 64, 0)
  grad.addColorStop(0, '#5a5a5a')
  grad.addColorStop(0.25, '#dcdcdc')
  grad.addColorStop(0.5, '#ffffff')
  grad.addColorStop(0.75, '#dcdcdc')
  grad.addColorStop(1, '#5a5a5a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 32)

  // Soft chamfer fade at very top & bottom of crimp
  ctx.fillStyle = 'rgba(130, 130, 130, 0.85)'
  ctx.fillRect(0, 0, 64, 3)
  ctx.fillRect(0, 29, 64, 3)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.repeat.set(27, 1)
  texture.colorSpace = THREE.NoColorSpace
  crimpBumpTexture = texture
  return texture
}

/** Soft elliptical studio contact shadow anchored beneath each product. */
export function getShadowTexture() {
  if (shadowTexture) return shadowTexture

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 126)
  gradient.addColorStop(0, 'rgba(48, 39, 34, 0.55)')
  gradient.addColorStop(0.4, 'rgba(48, 39, 34, 0.24)')
  gradient.addColorStop(0.72, 'rgba(48, 39, 34, 0.06)')
  gradient.addColorStop(1, 'rgba(48, 39, 34, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  shadowTexture = texture
  return texture
}
