import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

export function LoadingVeil() {
  const [visible, setVisible] = useState(true)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let active = true
    const finish = () => {
      if (active) setVisible(false)
    }
    const fallback = window.setTimeout(finish, 4000)

    Promise.all([document.fonts.load('400 48px "Bad Script"'), document.fonts.ready])
      .then(finish, finish)

    return () => {
      active = false
      window.clearTimeout(fallback)
    }
  }, [])

  if (gone) return null

  return (
    <motion.div
      data-veil
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={() => { if (!visible) setGone(true) }}
      className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-cream"
      aria-hidden
    >
      <span className="px-5 text-center font-hand text-4xl text-ink sm:text-5xl">Aroma Farmacy</span>
    </motion.div>
  )
}
