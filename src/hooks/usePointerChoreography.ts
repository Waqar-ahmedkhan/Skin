import { useEffect, useRef } from 'react'
import type { Chapter } from '@/lib/scroll'
import { interaction } from '@/lib/interaction'

/**
 * One global pointer choreography:
 *  - hero / showcase: horizontal swipe steps the carousel
 *  - scanner: keep the back label still while the scan is in progress
 * It ignores presses that begin on interactive UI so buttons stay reliable.
 */
export function usePointerChoreography(
  chapter: Chapter,
  next: () => void,
  prev: () => void,
) {
  const callbacks = useRef({ next, prev })
  callbacks.current = { next, prev }

  useEffect(() => {
    let down = false
    let ignore = false
    let startX = 0
    let startY = 0
    let lastX = 0
    document.documentElement.dataset.chapter = chapter

    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      ignore = Boolean(target?.closest('button, a, input, select, textarea, [data-ui]'))
      if (ignore) return
      down = true
      document.documentElement.dataset.dragging = 'true'
      startX = event.clientX
      startY = event.clientY
      lastX = event.clientX
    }

    const onMove = (event: PointerEvent) => {
      if (!down || ignore) return
      const dx = event.clientX - lastX
      lastX = event.clientX
      if (chapter === 'hero' && event.pointerType === 'mouse') {
        interaction.rotation += dx * 0.006
      }
    }

    const onUp = (event: PointerEvent) => {
      delete document.documentElement.dataset.dragging
      if (!down || ignore) {
        down = false
        return
      }
      down = false
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (chapter !== 'scan' && Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        if (dx < 0) callbacks.current.next()
        else callbacks.current.prev()
      }
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      delete document.documentElement.dataset.dragging
      delete document.documentElement.dataset.chapter
    }
  }, [chapter])
}
