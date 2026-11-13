import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { CartProvider } from '@/lib/cart'
import { scrollState, scrollToScannerProduct, setupScrollExperience } from '@/lib/scroll'
import { scanSpring } from '@/lib/scanner'
import { clamp01, smoothstep } from '@/lib/utils'
import { useChapter, useIsMobile, usePrefersReducedMotion } from '@/hooks/useMedia'
import { usePointerChoreography } from '@/hooks/usePointerChoreography'
import { products } from '@/data/products'
import type { Hotspot } from '@/data/hotspots'
import { Background } from '@/components/Background'
import { TypeLayer } from '@/components/TypeLayer'
import { Scene } from '@/three/Scene'
import { Nav } from '@/components/Nav'
import { HeroUI } from '@/components/HeroUI'
import { ScannerUI } from '@/components/ScannerUI'
import { ShowcaseUI } from '@/components/ShowcaseUI'
import { CartDrawer, AddToast } from '@/components/CartDrawer'
import { CollectionModal } from '@/components/CollectionModal'
import { LoadingVeil } from '@/components/LoadingVeil'

function Experience() {
  const [active, setActive] = useState(0)
  const [hotspot, setHotspot] = useState<Hotspot | null>(null)
  const [collectionOpen, setCollectionOpen] = useState(false)

  const chapter = useChapter()
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()

  const heroRef = useRef<HTMLElement | null>(null)
  const scanRef = useRef<HTMLElement | null>(null)
  const showRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })
  const { scrollYProgress: rawScanP } = useScroll({
    target: scanRef,
    offset: ['start start', 'end end'],
  })
  const smoothScanP = useSpring(rawScanP, scanSpring)
  const scanP = reducedMotion ? rawScanP : smoothScanP
  const { scrollYProgress: showP } = useScroll({
    target: showRef,
    offset: ['start start', 'end end'],
  })
  useEffect(() => {
    if (chapter === 'scan') return
    smoothScanP.jump(rawScanP.get())
    scrollState.scanVisual = clamp01(rawScanP.get())
  }, [chapter, rawScanP, smoothScanP])

  const wash = useTransform([heroP, showP], ([h, c]: number[]) =>
    smoothstep(0.86, 0.98, h) * (1 - smoothstep(0.06, 0.3, c)),
  )

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const debug = window as unknown as Record<string, number>
    const subscriptions = [
      heroP.on('change', (v) => (debug.__heroP = v)),
      scanP.on('change', (v) => (debug.__scanP = v)),
      showP.on('change', (v) => (debug.__showP = v)),
    ]
    return () => subscriptions.forEach((unsubscribe) => unsubscribe())
  }, [heroP, scanP, showP])

  useEffect(() => {
    window.scrollTo(0, 0)
    const cleanup = setupScrollExperience()
    const refresh = () => window.setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      cleanup()
    }
  }, [])

  const next = useCallback(() => setActive((i) => (i + 1) % products.length), [])
  const prev = useCallback(() => setActive((i) => (i - 1 + products.length) % products.length), [])

  usePointerChoreography(chapter, next, prev)

  useEffect(() => {
    if (collectionOpen) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('button, a, input, select, textarea, [role="dialog"]')) return
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      event.preventDefault()
      const direction = event.key === 'ArrowRight' ? 1 : -1
      if (chapter === 'scan') {
        scrollToScannerProduct((active + direction + products.length) % products.length, products.length)
      } else if (direction > 0) next()
      else prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, collectionOpen, chapter, active])

  useEffect(() => {
    setHotspot(null)
  }, [active])

  useMotionValueEvent(scanP, 'change', (p) => {
    scrollState.scanVisual = clamp01(p)
    if (chapter !== 'scan') return
    const idx = Math.min(products.length - 1, Math.floor(clamp01(p) * products.length))
    setActive((prevIdx) => (prevIdx === idx ? prevIdx : idx))
  })

  useEffect(() => {
    if (chapter !== 'scan') return
    const idx = Math.min(products.length - 1, Math.floor(clamp01(scanP.get()) * products.length))
    setActive((prevIdx) => (prevIdx === idx ? prevIdx : idx))
  }, [chapter, scanP])

  const handleScannerSelect = useCallback((idx: number) => {
    setActive(idx)
    scrollToScannerProduct(idx, products.length)
  }, [])

  return (
    <div className="relative">
      <LoadingVeil />
      <Background active={active} wash={wash} />
      <TypeLayer
        scanP={scanP}
        showP={showP}
        active={active}
      />

      <Scene
        active={active}
        onSelect={setActive}
        showHotspots={false}
        onHotspot={setHotspot}
        activeHotspot={hotspot?.key ?? null}
        isMobile={isMobile}
      />

      <Nav />

      <HeroUI
        active={active}
        setActive={setActive}
        next={next}
        prev={prev}
        heroP={heroP}
        inert={chapter !== 'hero'}
      />

      <ScannerUI
        product={products[active]}
        active={active}
        setActive={handleScannerSelect}
        heroP={heroP}
        scanP={scanP}
        inert={chapter !== 'scan' || collectionOpen}
      />

      <ShowcaseUI
        active={active}
        setActive={setActive}
        scanP={scanP}
        showP={showP}
        onExplore={() => setCollectionOpen(true)}
        inert={chapter !== 'showcase'}
      />

      <CartDrawer />
      <AddToast />
      <CollectionModal open={collectionOpen} onClose={() => setCollectionOpen(false)} onSelect={setActive} />

      <main className="relative z-0">
        <section
          id="hero"
          ref={heroRef}
          className="h-[150svh] md:h-[160svh]"
          aria-label="Aroma Farmacy — hero"
        />
        <section
          id="scanner"
          ref={scanRef}
          className="-mt-[100svh] h-[1000svh] md:h-[1240svh]"
          aria-label="A closer study of the product"
        />
        <section
          id="showcase"
          ref={showRef}
          className="h-[290svh] md:h-[340svh]"
          aria-label="The complete collection"
        />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <Experience />
    </CartProvider>
  )
}
