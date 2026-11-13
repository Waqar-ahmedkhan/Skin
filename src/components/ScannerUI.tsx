import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { Pause, Play, RotateCcw } from 'lucide-react'

import { ScanParticles } from '@/components/ScanParticles'
import { usePrefersReducedMotion } from '@/hooks/useMedia'

import { products, type IngredientDetail, type Product } from '@/data/products'
import { getScanState, scanTiming } from '@/lib/scanner'
import { clamp01, cn, smoothstep } from '@/lib/utils'

interface ScannerUIProps {
  product: Product
  active: number
  setActive: (index: number) => void
  heroP: MotionValue<number>
  scanP: MotionValue<number>
  inert?: boolean
}

function IngredientCheck({ progress }: { progress: MotionValue<number> }) {
  const pathLength = useTransform(progress, value => smoothstep(0.8, 1, value))

  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <motion.path
        d="M3 8.5 6.5 12 13 4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ pathLength }}
      />
    </svg>
  )
}

interface ScanPillProps {
  ingredient: IngredientDetail
  index: number
  count: number
  pass: MotionValue<number>
  checked: number
  selected: boolean
  started: boolean
  onSelect: () => void
}

function ScanPill({ ingredient, index, count, pass, checked, selected, started, onSelect }: ScanPillProps) {
  const progress = useTransform(pass, value => clamp01(value * count - index))
  const verified = index < checked

  return (
    <button
      type="button" data-ui aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'scan-ingredient-pill', selected && 'is-selected', verified && 'is-checked',
        started && index === checked && 'is-reading',
      )}
    >
      <motion.span style={{ scaleX: progress }} className="scan-pill-progress" aria-hidden />
      <IngredientCheck progress={progress} />
      {ingredient.name}
      <span className="sr-only">{verified ? ', checked in product data' : ', awaiting check'}</span>
    </button>
  )
}

export function ScannerUI({ product, active, setActive, heroP, scanP, inert }: ScannerUIProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [particlesPaused, setParticlesPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const count = product.ingredientDetails.length
  const [scan, setScan] = useState(() => getScanState(scanP.get(), products.length, count))

  useEffect(() => {
    setSelected(null)
    setScan(getScanState(scanP.get(), products.length, count))
  }, [active, scanP, count])

  useMotionValueEvent(scanP, 'change', progress => {
    const next = getScanState(progress, products.length, count)
    setScan(previous => {
      const sameStatus = previous.index === next.index && previous.checked === next.checked &&
        (previous.local >= scanTiming.start) === (next.local >= scanTiming.start)
      const wasVisible = previous.local >= scanTiming.windowStart && previous.local <= scanTiming.windowEnd
      const isVisible = next.local >= scanTiming.windowStart && next.local <= scanTiming.windowEnd
      return sameStatus && wasVisible === isVisible ? previous : next
    })
  })

  const pass = useTransform(scanP, progress => getScanState(progress, products.length, count).pass)
  const scanY = useTransform(pass, value => `${value * 100}%`)
  const windowY = useTransform(pass, value => `${-value * 100}%`)
  const opacity = useTransform([heroP, scanP], ([hero, progress]: number[]) =>
    smoothstep(0.92, 0.99, hero) * (1 - smoothstep(0.97, 1, progress)),
  )
  const frameOpacity = useTransform(scanP, progress => {
    const { local } = getScanState(progress, products.length, count)
    return smoothstep(scanTiming.windowStart, scanTiming.start, local) *
      (1 - smoothstep(scanTiming.returnStart, scanTiming.windowEnd, local))
  })
  const windowActive = scan.local >= scanTiming.windowStart && scan.local <= scanTiming.windowEnd
  const started = scan.local >= scanTiming.start
  const particlesActive = !inert && windowActive && started && !scan.complete
  const detailIndex = selected ?? Math.min(scan.checked, count - 1)
  const status = scan.complete
    ? 'Ingredients checked'
    : started ? 'Scanning' : 'Ready to scan'

  return (
    <motion.section
      style={{ opacity }}
      className="scan-composition pointer-events-none fixed inset-0 z-30"
      inert={inert}
      aria-hidden={inert || undefined}
      aria-label={`${product.name} ingredient scan`}
    >
      <motion.div
        style={{ opacity: frameOpacity }} className="scan-cutout"
        inert={!windowActive} aria-hidden={!windowActive || undefined}
      >
        <div className="scan-guide-rails" aria-hidden />
        <motion.div style={{ y: scanY }} className="absolute inset-0 will-change-transform">
          <motion.div style={{ y: windowY }} className="scan-window">
            <div className="scan-product-badge">
              <span style={{ backgroundColor: product.palette.body }} className="size-1.5 rounded-full" />
              Aroma Farmacy {product.name}
            </div>
            <div className="scan-window-optics" aria-hidden>
              <ScanParticles
                active={particlesActive} paused={particlesPaused} reduced={reducedMotion}
                tint={product.palette.bodyLight}
              />
            </div>
            <div className="scan-pill-rail" aria-label="Inspect a featured ingredient">
              {product.ingredientDetails.map((ingredient, index) => (
                <ScanPill
                  key={`${product.id}-pill-${ingredient.name}`}
                  ingredient={ingredient} index={index} count={count} pass={pass} checked={scan.checked}
                  selected={detailIndex === index} started={started}
                  onSelect={() => setSelected(selected === index ? null : index)}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="scan-summary">
        <h3 className="scan-focused-ingredient">{product.ingredientDetails[detailIndex].name}</h3>
        <p className="mt-1 text-[12px] text-ink-soft" role="status" aria-live="polite" aria-atomic="true">
          {status} · {scan.checked}/{count}
        </p>
        {selected !== null && (
          <p className="mx-auto mt-2 max-w-[380px] text-xs text-ink-soft">
            {product.ingredientDetails[selected].percent} · {product.ingredientDetails[selected].role}
          </p>
        )}
        <p className="mt-1 text-[9px] text-ink-soft">Featured ingredient data</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 lg:px-10">
        <div className="flex items-center justify-between gap-4 border-t border-ink/15 pt-3.5">
          <div className="no-scrollbar flex flex-1 gap-4 overflow-x-auto sm:gap-6" aria-label="Choose a formula to scan">
            {products.map((item, index) => (
              <button
                key={item.id}
                type="button"
                data-ui
                aria-pressed={index === active}
                onClick={() => setActive(index)}
                className={cn(
                  'pointer-events-auto min-h-11 shrink-0 text-[10px] uppercase tracking-[0.12em]',
                  index === active ? 'text-ink underline underline-offset-8' : 'text-ink-soft',
                )}
              >
                {item.index} {item.name}
              </button>
            ))}
          </div>
          {!reducedMotion && (
            <button
              type="button" data-ui
              onClick={() => setParticlesPaused(value => !value)}
              aria-label={particlesPaused ? 'Resume scanner particles' : 'Pause scanner particles'}
              title={particlesPaused ? 'Resume scanner particles' : 'Pause scanner particles'}
              aria-pressed={particlesPaused}
              className="scan-particle-control pointer-events-auto"
            >
              {particlesPaused ? <Play size={13} /> : <Pause size={13} />}
            </button>
          )}
          <button
            type="button"
            data-ui
            onClick={() => {
              setSelected(null)
              setActive(active)
            }}
            className="pointer-events-auto inline-flex min-h-11 shrink-0 items-center gap-2 text-xs"
          >
            <RotateCcw size={13} /> Replay scan
          </button>
        </div>
      </div>
    </motion.section>
  )
}
