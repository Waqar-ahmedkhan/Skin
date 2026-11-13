export const scanParticleDensity = { wide: 320, narrow: 192, narrowWidth: 180 }

export interface ScanParticle {
  x: number
  y: number
  speed: number
  phase: number
  size: number
  light: boolean
}

const fraction = (value: number) => value - Math.floor(value)
const seed = (index: number, salt: number) => fraction(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453)

/** Stable particles avoid random jumps when a product is selected or a scan resumes. */
export const createScanParticles = (count: number): ScanParticle[] =>
  Array.from({ length: count }, (_, index) => ({
    x: 0.04 + seed(index, 1) * 0.92,
    y: seed(index, 2),
    speed: 0.11 + seed(index, 3) * 0.13,
    phase: seed(index, 4) * Math.PI * 2,
    size: 3 + seed(index, 5) * 5.5,
    light: index % 4 !== 0,
  }))

export function sampleScanParticle(particle: ScanParticle, seconds: number) {
  const y = fraction(particle.y + seconds * particle.speed)
  const edgeFade = Math.min(1, y / 0.16, (1 - y) / 0.2)

  return {
    x: particle.x + Math.sin(seconds * 0.9 + particle.phase) * 0.025,
    y,
    alpha: edgeFade * (0.32 + (Math.sin(seconds * 1.2 + particle.phase) + 1) * 0.15),
    size: particle.size,
  }
}

/** Gate work on the actual scan phase, user controls, and document visibility. */
export const shouldAnimateScan = (active: boolean, paused: boolean, reduced: boolean, visible: boolean) =>
  active && !paused && !reduced && visible
