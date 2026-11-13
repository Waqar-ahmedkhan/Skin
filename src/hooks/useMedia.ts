import { useEffect, useState } from 'react'
import { chapterStore, type Chapter } from '@/lib/scroll'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Re-renders only when a chapter boundary is crossed, never on scroll. */
export function useChapter() {
  const [chapter, setChapter] = useState<Chapter>(chapterStore.current)
  useEffect(() => {
    const unsubscribe = chapterStore.subscribe(setChapter)
    return () => {
      unsubscribe()
    }
  }, [])
  return chapter
}
