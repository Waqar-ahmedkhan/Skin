import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/data/products'
import { invalidateLabelCache, makeLabelTexture } from './labelTexture'

let fontsResolved = false
let fontReadyPromise: Promise<void> | null = null

function waitForFontsOnce(): Promise<void> {
  if (fontsResolved) return Promise.resolve()
  if (fontReadyPromise) return fontReadyPromise

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  if (!fonts) {
    fontsResolved = true
    return Promise.resolve()
  }

  fontReadyPromise = Promise.all([
    fonts.load('400 48px "Bad Script"').catch(() => []),
    fonts.ready,
  ]).then(() => {
    if (!fontsResolved) {
      fontsResolved = true
      invalidateLabelCache()
    }
  })
  return fontReadyPromise
}

/**
 * Generates cached canvas label textures once web fonts settle without
 * invalidating caches repeatedly per mounted 3D instance.
 */
export function useLabelTexture(product: Product) {
  const [ready, setReady] = useState(fontsResolved)

  useEffect(() => {
    if (ready) return
    let alive = true
    waitForFontsOnce().then(() => {
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [ready])

  return useMemo(() => makeLabelTexture(product), [product, ready])
}
