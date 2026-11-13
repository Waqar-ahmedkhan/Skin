import { useEffect, useRef } from 'react'

import { createScanParticles, sampleScanParticle, scanParticleDensity, shouldAnimateScan } from '@/lib/scanParticles'

interface ScanParticlesProps {
  active: boolean
  paused: boolean
  reduced: boolean
  tint: string
}

const particles = createScanParticles(scanParticleDensity.wide)

export function ScanParticles({ active, paused, reduced, tint }: ScanParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elapsed = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let frame = 0
    let previousTime = 0
    let width = 0, height = 0
    const colors = ['#fffaf3', tint]

    const draw = () => {
      context.clearRect(0, 0, width, height)
      if (!width || !height) return
      const count = width < scanParticleDensity.narrowWidth ? scanParticleDensity.narrow : particles.length

      for (let index = 0; index < count; index++) {
        const particle = particles[index]
        const sample = sampleScanParticle(particle, elapsed.current)
        context.globalAlpha = sample.alpha
        context.fillStyle = colors[particle.light ? 0 : 1]
        const tileWidth = index % 7 === 0 ? sample.size * 1.5 : sample.size
        context.fillRect(Math.round(sample.x * width), Math.round(sample.y * height), tileWidth, sample.size)
      }

      // A restrained, moving optical edge gives the field a clear scan direction.
      const sweep = ((elapsed.current * 0.24) % 1) * height
      const fade = Math.min(1, sweep / 12, (height - sweep) / 12)
      const trail = context.createLinearGradient(0, sweep - 14, 0, sweep + 1)
      trail.addColorStop(0, 'rgba(255,250,243,0)')
      trail.addColorStop(1, `rgba(255,250,243,${fade * 0.44})`)
      context.globalAlpha = 1
      context.fillStyle = trail
      context.fillRect(0, sweep - 14, width, 15)
      context.fillStyle = `rgba(255,250,243,${fade * 0.88})`
      context.fillRect(0, Math.round(sweep), width, 1)
    }

    const animate = (time: number) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0
      previousTime = time
      elapsed.current += delta
      draw()
      frame = requestAnimationFrame(animate)
    }

    const synchronize = () => {
      cancelAnimationFrame(frame)
      previousTime = 0
      draw()
      if (shouldAnimateScan(active, paused, reduced, !document.hidden)) {
        frame = requestAnimationFrame(animate)
      }
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    document.addEventListener('visibilitychange', synchronize)
    resize()
    synchronize()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', synchronize)
    }
  }, [active, paused, reduced, tint])

  return <canvas ref={canvasRef} className="scan-particle-canvas" aria-hidden />
}
