import { motion, useTransform, type MotionValue } from 'motion/react'
import { products } from '@/data/products'
import { smoothstep } from '@/lib/utils'

interface TypeLayerProps {
  scanP: MotionValue<number>
  showP: MotionValue<number>
  active: number
}

/**
 * Typography that sits *behind* the WebGL canvas so the products frame cleanly
 * beneath or in front of the words without colliding with wordforms.
 */
export function TypeLayer({ scanP, showP, active }: TypeLayerProps) {
  const heroOpacity = useTransform(scanP, p => 1 - smoothstep(0.965, 1, p))
  const showHeadOpacity = useTransform([showP], ([p]: number[]) =>
    smoothstep(0.01, 0.11, p) * (1 - smoothstep(0.3, 0.42, p)),
  )
  const showHeadY = useTransform(showP, [0.01, 0.4], [24, -30])

  const finalOpacity = useTransform(
    [showP],
    ([p]: number[]) => smoothstep(0.74, 0.88, p),
  )
  const finalY = useTransform(showP, [0.74, 1], [46, 0])

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.h1 style={{ opacity: heroOpacity }} className="hero-headline">
        <span className="hero-word-one">One</span>
        <span className="hero-word-balm">{products[active].kind === 'serum' ? 'serum' : 'balm'}</span>
        <span className="hero-word-everywhere">for<br />every<wbr />where.</span>
      </motion.h1>

      {/* showcase heading */}
      <motion.div
        style={{ opacity: showHeadOpacity, y: showHeadY }}
        className="absolute inset-x-0 top-[13vh] px-5 text-center"
      >
        <h2 className="font-serif text-[clamp(2.4rem,5vw,4rem)] font-light leading-[0.9] tracking-[-0.02em] text-ink">
          Every shade{' '}
          <em
            className="italic transition-colors duration-1000"
            style={{ color: products[active].palette.bodyDeep }}
          >
            of soft.
          </em>
        </h2>
      </motion.div>

      {/* final composition headline */}
      <motion.div
        style={{ opacity: finalOpacity, y: finalY }}
        className="absolute inset-x-0 top-[max(92px,12vh)] px-5 text-center"
      >
        <h2 className="font-serif text-[clamp(1.35rem,3.2vw,2.8rem)] font-light uppercase leading-[1.1] tracking-[-0.01em] text-ink/90">
          Aroma Farmacy,{' '}
          <em className="italic">
            everywhere.
          </em>
        </h2>
      </motion.div>
    </div>
  )
}
