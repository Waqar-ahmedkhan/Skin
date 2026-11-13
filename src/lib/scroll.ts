import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { scanTiming } from './scanner'

gsap.registerPlugin(ScrollTrigger)

/**
 * A single mutable frame-state shared by the WebGL scene and the DOM overlays.
 * Written by ScrollTrigger, read by useFrame — never triggers React renders.
 */
export const scrollState = {
  hero: 0,
  scan: 0,
  scanVisual: 0,
  showcase: 0,
  /** 0 → 3 across the three chapters (continuous) */
  g: 0,
  direction: 1,
  velocity: 0,
  reduced: false,
}

if (import.meta.env.DEV) {
  ;(window as unknown as { __aromaFarmacyScroll: typeof scrollState }).__aromaFarmacyScroll = scrollState
}

export type Chapter = 'hero' | 'scan' | 'showcase'

type ChapterListener = (chapter: Chapter) => void

export const chapterStore = {
  current: 'hero' as Chapter,
  listeners: new Set<ChapterListener>(),
  set(next: Chapter) {
    if (this.current === next) return
    this.current = next
    this.listeners.forEach((fn) => fn(next))
  },
  subscribe(fn: ChapterListener) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  },
}

let lenisInstance: Lenis | null = null

export const getLenis = () => lenisInstance

export function scrollToId(id: string) {
  const target = document.querySelector(`#${id}`)
  if (!target) return

  if (lenisInstance) {
    lenisInstance.scrollTo(target as HTMLElement, { offset: 0, duration: scrollState.reduced ? 0 : 1.6 })
    return
  }

  target.scrollIntoView({ behavior: scrollState.reduced ? 'auto' : 'smooth', block: 'start' })
}

export function scrollToScannerProduct(index: number, total: number) {
  const el = document.querySelector('#scanner') as HTMLElement | null
  if (!el || total <= 0) return

  const clampedIdx = Math.max(0, Math.min(total - 1, index))
  // Start at the top of the back label so no ingredient check is skipped.
  const progress = (clampedIdx + scanTiming.start) / total
  const scrollable = Math.max(1, el.offsetHeight - window.innerHeight)
  const targetY = el.offsetTop + progress * scrollable

  if (lenisInstance) {
    lenisInstance.scrollTo(targetY, { duration: scrollState.reduced ? 0 : 1.15 })
    return
  }

  window.scrollTo({ top: targetY, behavior: scrollState.reduced ? 'auto' : 'smooth' })
}

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: scrollState.reduced ? 0 : 1.4 })
    return
  }
  window.scrollTo({ top: 0, behavior: scrollState.reduced ? 'auto' : 'smooth' })
}

/** Wire Lenis + ScrollTrigger together. Returns a cleanup fn. */
export function setupScrollExperience() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scrollState.reduced = reduced

  const lenis = new Lenis({
    duration: reduced ? 0.1 : 1.35,
    lerp: reduced ? 1 : 0.085,
    smoothWheel: !reduced,
    syncTouch: false,
    touchMultiplier: 1.35,
    wheelMultiplier: 0.9,
  })
  lenisInstance = lenis

  lenis.on('scroll', (event: { velocity: number; direction: number }) => {
    scrollState.velocity = event.velocity
    scrollState.direction = event.direction
    ScrollTrigger.update()
  })

  const raf = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  const mk = (id: string, key: 'hero' | 'scan' | 'showcase') =>
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollState[key] = self.progress
        scrollState.g =
          scrollState.hero +
          scrollState.scan +
          scrollState.showcase
        const g = scrollState.g
        chapterStore.set(
          g < 0.985
            ? 'hero'
            : g < 1.985
              ? 'scan'
              : 'showcase',
        )
      },
    })

  const triggers = [
    mk('hero', 'hero'),
    mk('scanner', 'scan'),
    mk('showcase', 'showcase'),
  ]

  // initialise once layout settles
  requestAnimationFrame(() => ScrollTrigger.refresh())

  return () => {
    triggers.forEach((t) => t.kill())
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenisInstance = null
    scrollState.hero = 0
    scrollState.scan = 0
    scrollState.scanVisual = 0
    scrollState.showcase = 0
    scrollState.g = 0
  }
}

export function setScrollLocked(locked: boolean) {
  if (!lenisInstance) return
  if (locked) lenisInstance.stop()
  else lenisInstance.start()
}
