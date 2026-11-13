import type { Finish } from '@/data/products'

export function finishProps(finish: Finish) {
  switch (finish) {
    case 'matte':
      return {
        roughness: 0.4,
        clearcoat: 0.35,
        clearcoatRoughness: 0.24,
        envMapIntensity: 1,
      }
    case 'dewy':
      return {
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.15,
      }
    default:
      return {
        roughness: 0.27,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.05,
      }
  }
}

export function glassProps(isMobile: boolean) {
  return {
    color: '#FFFDF8',
    roughness: 0.08,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.12,
    ior: 1.5,
    thickness: 0.055,
    attenuationColor: '#FFF3DC',
    attenuationDistance: 3,
    envMapIntensity: 1.1,
    transmission: isMobile ? 0 : 0.94,
    transparent: isMobile,
    opacity: isMobile ? 0.28 : 1,
    depthWrite: !isMobile,
  }
}
