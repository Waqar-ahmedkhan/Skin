import { AnimatePresence, motion, type MotionValue } from 'motion/react'
import { products } from '@/data/products'

interface BackgroundProps {
  active: number
  wash: MotionValue<number>
}

/**
 * Fixed canvas backdrop. The product tint crossfades on selection; a separate
 * lavender wash is scroll-linked for the scanner chapter.
 */
export function Background({ active, wash }: BackgroundProps) {
  const product = products[active]

  return (
    <>
      <div className="fixed inset-0 z-0 bg-cream" />

      <AnimatePresence initial={false}>
        <motion.div
          key={product.id}
          className="fixed inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `radial-gradient(48% 42% at 50% 46%, ${product.palette.glow} 0%, transparent 72%), radial-gradient(125% 105% at 50% 4%, ${product.palette.backdrop[0]} 0%, ${product.palette.backdrop[1]} 100%)`,
          }}
        />
      </AnimatePresence>

      {/* quiet atmospheric softness borrowed gently from product warmth */}
      <div
        aria-hidden
        className="pointer-events-none fixed -right-[16vw] -top-[20vw] z-0 size-[56vw] rounded-full opacity-25 blur-[130px] transition-colors duration-1000"
        style={{ backgroundColor: product.palette.glow }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-[26vw] -left-[16vw] z-0 size-[52vw] rounded-full opacity-20 blur-[130px] transition-colors duration-1000"
        style={{ backgroundColor: product.palette.backdrop[1] }}
      />

      <motion.div
        className="fixed inset-0 z-0"
        style={{
          opacity: wash,
          background:
            `linear-gradient(178deg, ${product.palette.backdrop[0]} 0%, ${product.palette.backdrop[1]} 100%)`,
        }}
      />

      {/* studio lift */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(52% 42% at 50% 42%, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0) 72%)',
        }}
      />

      {/* vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 45%, rgb(48 39 34 / 0) 55%, rgb(48 39 34 / 0.09) 100%)',
        }}
      />

      <div className="grain pointer-events-none fixed inset-0 z-0" />
    </>
  )
}
